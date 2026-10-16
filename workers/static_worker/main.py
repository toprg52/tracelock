import pika
import json
import os
import tempfile
import asyncio
from typing import Optional
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.future import select

from backend.app.core.config import settings
from backend.app.models.models import Case
from backend.app.services.apk_validator import ApkValidator
from backend.app.services.manifest_parser import ManifestParser
from backend.app.services.permission_analyzer import PermissionAnalyzer
from backend.app.services.certificate_analyzer import CertificateAnalyzer
from backend.app.services.jadx_service import JadxService
from backend.app.services.ioc_extractor import IocExtractor
from backend.app.services.obfuscation_service import ObfuscationService
from backend.app.services.artifact_service import ArtifactService

# Database setup for worker process
engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)

async def update_case_status(case_id: str, status: str, artifacts_meta: Optional[dict] = None):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Case).filter(Case.id == case_id))
        case_obj = result.scalars().first()
        if case_obj:
            case_obj.status = status
            if artifacts_meta:
                case_obj.permissions_json = artifacts_meta.get("permissions")
                case_obj.manifest_json = artifacts_meta.get("manifest")
                case_obj.evidence_json = artifacts_meta.get("ioc")
            await session.commit()

def process_message(ch, method, properties, body):
    payload = json.loads(body)
    case_id = payload["case_id"]
    filename = payload["filename"]
    
    print(f"[*] Starting static analysis for case: {case_id} ({filename})")
    
    # Retrieve the actual binary from MinIO object storage tier
    artifact_service = ArtifactService()
    storage_path = payload.get("storage_path") or f"apks/{case_id}.apk"
    
    with tempfile.NamedTemporaryFile(suffix=".apk", delete=False) as tmp_file:
        tmp_path = tmp_file.name
        
        if artifact_service.use_fallback:
            import os
            local_path = os.path.join("local_artifacts", "apks", f"{case_id}.apk")
            if os.path.exists(local_path):
                with open(local_path, "rb") as f:
                    tmp_file.write(f.read())
            else:
                tmp_file.write(b"PK\x03\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00")
        else:
            try:
                response = artifact_service.client.get_object("artifacts", storage_path)
                tmp_file.write(response.read())
                response.close()
                response.release_conn()
            except Exception as e:
                print(f"[!] MinIO retrieval failed: {str(e)}. Attempting local fallback.")
                import os
                local_path = os.path.join("local_artifacts", "apks", f"{case_id}.apk")
                if os.path.exists(local_path):
                    with open(local_path, "rb") as f:
                        tmp_file.write(f.read())
                else:
                    tmp_file.write(b"PK\x03\x04\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00")
    
    # Run localized JADX command line call to dump resources
    import subprocess
    try:
        out_dir = tempfile.mkdtemp()
        subprocess.run(
            ["jadx", "--dump-resources", "-d", out_dir, tmp_path],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
    except Exception as e:
        print(f"[!] JADX command call failed: {str(e)}")
    
    try:
        # 1. Validation
        valid, msg = ApkValidator.validate(tmp_path)
        validation_data = {"valid": valid, "message": msg}
        
        # 2. Manifest Parser
        manifest = ManifestParser.parse(tmp_path)
        
        # 3. Permissions Risk
        permissions = manifest.get("permissions", [])
        analyzer = PermissionAnalyzer()
        perm_risk = analyzer.analyze(permissions)
        
        # 4. Certificate
        cert = CertificateAnalyzer.analyze(tmp_path)
        
        # 5. Extract fallback strings & IOCs
        strings = JadxService.extract_strings_fallback(tmp_path)
        raw_text = " ".join(strings)
        iocs = IocExtractor.extract_from_text(raw_text)
        
        # 6. Obfuscation
        obfuscation = ObfuscationService.analyze_strings(strings)
        
        # Save artifacts
        artifact_service = ArtifactService()
        artifact_service.save_artifact(case_id, "validation.json", validation_data)
        artifact_service.save_artifact(case_id, "manifest.json", manifest)
        artifact_service.save_artifact(case_id, "permissions.json", perm_risk)
        artifact_service.save_artifact(case_id, "certificate.json", cert)
        artifact_service.save_artifact(case_id, "ioc.json", {"iocs": iocs})
        artifact_service.save_artifact(case_id, "obfuscation.json", obfuscation)
        
        # Trigger Gemini stateful analysis pipeline
        try:
            from backend.app.llm.gemini import GeminiPipeline
            pipeline = GeminiPipeline()
            raw_extraction = {
                "manifest": manifest,
                "permissions": permissions,
                "certificate": cert,
                "iocs": iocs,
                "obfuscation": obfuscation
            }
            pipeline.run_dossier_analysis(case_id, raw_extraction)
        except Exception as ai_err:
            print(f"[!] Gemini Pipeline execution failed: {str(ai_err)}")
        
        # Update case state in database
        artifacts_meta = {
            "permissions": perm_risk,
            "manifest": manifest,
            "ioc": {"iocs": iocs}
        }
        asyncio.run(update_case_status(case_id, "analyzing_dynamic", artifacts_meta))
        
        # Publish job to dynamic analysis queue
        from backend.app.core.queue import publish_job
        dynamic_payload = {
            "case_id": case_id,
            "filename": filename
        }
        publish_job("dynamic_analysis", dynamic_payload)
        print(f"[+] Static analysis completed successfully. Enqueued case {case_id} to dynamic analysis.")
        
    except Exception as e:
        print(f"[!] Analysis failed: {str(e)}")
        asyncio.run(update_case_status(case_id, "failed"))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
            
    ch.basic_ack(delivery_tag=method.delivery_tag)

def main():
    print("[*] Static Analysis Worker daemon listening for jobs...")
    try:
        params = pika.URLParameters(settings.RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.queue_declare(queue="static_analysis", durable=True)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue="static_analysis", on_message_callback=process_message)
        channel.start_consuming()
    except Exception as e:
        print(f"[!] RabbitMQ Connection failed: {str(e)}")

if __name__ == "__main__":
    main()
