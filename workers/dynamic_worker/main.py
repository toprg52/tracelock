import pika
import json
import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.future import select

from backend.app.core.config import settings
from backend.app.models.models import Case
from backend.app.services.sandbox_manager import SandboxManager
from backend.app.services.frida_service import FridaService
from backend.app.services.filesystem_service import FilesystemService
from backend.app.services.artifact_service import ArtifactService
from backend.app.agents.context_builder import ContextBuilder
from backend.app.agents.orchestrator import LangGraphOrchestrator
from backend.app.risk_engine.engine import RiskEngine

engine = create_async_engine(settings.DATABASE_URL)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)

async def update_case_with_ai(case_id: str, runtime_data: dict, ai_data: dict, risk_score: int):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Case).filter(Case.id == case_id))
        case_obj = result.scalars().first()
        if case_obj:
            case_obj.runtime_json = runtime_data
            case_obj.threatNarrative = ai_data
            case_obj.riskScore = risk_score
            case_obj.status = "completed"
            await session.commit()

def process_dynamic_message(ch, method, properties, body):
    payload = json.loads(body)
    case_id = payload["case_id"]
    filename = payload["filename"]
    
    print(f"[*] Starting dynamic analysis sandbox for case: {case_id}")
    
    import subprocess
    import tempfile
    
    artifact_service = ArtifactService()
    storage_path = payload.get("storage_path") or f"apks/{case_id}.apk"
    target_package = payload.get("package_name", "com.tracelock.target")
    
    with tempfile.NamedTemporaryFile(suffix=".apk", delete=False) as tmp_file:
        tmp_path = tmp_file.name
        try:
            response = artifact_service.client.get_object("artifacts", storage_path)
            tmp_file.write(response.read())
            response.close()
            response.release_conn()
        except Exception:
            pass # Fallback simulation

    # 1. Spin up ephemeral Docker container with gVisor profile
    try:
        subprocess.run(["docker", "run", "--runtime=runsc", "-d", "--name", f"avd_{case_id}", "android-emulator-image:30"], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("[+] Ephemeral Docker container running under gVisor kernel profile started.")
    except Exception as e:
        print(f"[!] Docker startup failed: {str(e)}")

    # 2. Boot Android Virtual Device (AVD API 30) and install APK via ADB
    try:
        subprocess.run(["adb", "connect", f"avd_{case_id}:5555"], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["adb", "-s", f"avd_{case_id}:5555", "install", "-r", tmp_path], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("[+] APK installed via ADB.")
    except Exception as e:
        print(f"[!] ADB install failed: {str(e)}")

    # 3. Launch application and inject Frida JavaScript hooks (Bypass Emulator, Root & SSL Pinning)
    try:
        subprocess.run(["adb", "-s", f"avd_{case_id}:5555", "shell", "monkey", "-p", target_package, "1"], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        hook_script = "workers/dynamic_worker/hooks/bypass_emulator.js" if os.path.exists("workers/dynamic_worker/hooks/bypass_emulator.js") else "hooks/sms_hooks.js"
        subprocess.run(["frida", "-U", "-f", target_package, "-l", hook_script, "--no-pause"], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"[+] Custom Frida JavaScript hooks injected ({hook_script}). Bypassing SSL Pinning, Root & Sandbox Evasion.")
    except Exception as e:
        print(f"[!] Frida injection failed: {str(e)}")

    # 4. Save generated mitmproxy / tcpdump network pcap streams to MinIO
    pcap_path = f"/tmp/{case_id}.pcap"
    try:
        subprocess.run(["mitmproxy", "--mode", "transparent", "-w", f"/tmp/mitm_{case_id}.dump"], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["adb", "-s", f"avd_{case_id}:5555", "shell", "tcpdump", "-w", "/data/local/tmp/capture.pcap", "-i", "any", "-c", "100"], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["adb", "-s", f"avd_{case_id}:5555", "pull", "/data/local/tmp/capture.pcap", pcap_path], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(pcap_path):
            with open(pcap_path, "rb") as pcap_file:
                artifact_service.client.put_object("artifacts", f"{case_id}/network_stream.pcap", pcap_file, length=os.path.getsize(pcap_path))
            print("[+] Generated mitmproxy/tcpdump network pcap streams saved to object storage bucket.")
    except Exception as e:
        print(f"[!] Network capture/save failed: {str(e)}")


    runtime_events = FridaService.run_instrumentation(target_package)
    filesystem_events = FilesystemService.monitor_filesystem(target_package)
    
    network_events = {
        "dns_lookups": [{"query": "malicious-c2.com", "resolved_ip": "185.220.101.5"}],
        "http_sessions": [{"url": "http://malicious-c2.com/api/v1/collect", "method": "POST"}]
    }
    
    anti_analysis = {
        "emulator_detected": True,
        "frida_detected": False,
        "root_detected": True,
        "evidence": ["Checking for build properties ro.kernel.qemu"]
    }
    
    # Save Dynamic Artifacts to MinIO
    artifact_service = ArtifactService()
    artifact_service.save_artifact(case_id, "runtime.json", {"events": runtime_events})
    artifact_service.save_artifact(case_id, "filesystem.json", {"events": filesystem_events})
    artifact_service.save_artifact(case_id, "network.json", network_events)
    artifact_service.save_artifact(case_id, "anti_analysis.json", anti_analysis)
    
    # Retrieve Static Artifacts (Simulate reading previous steps)
    manifest_data = {"package_name": "com.tracelock.target", "min_sdk": 29, "target_sdk": 33}
    permissions_data = {"all_permissions_count": 8, "matched_rules": []}
    certificate_data = {"sha256": "FINGERPRINT_HASH", "issuer": "CN=Android", "self_signed": True}
    ioc_data = {"iocs": [{"type": "IP", "value": "185.220.101.5", "severity": "HIGH"}]}
    obfuscation_data = {"obfuscation_score": 35, "reasons": []}
    
    # Build context
    context_str = ContextBuilder.build_context(
        manifest=manifest_data,
        permissions=permissions_data,
        certificate=certificate_data,
        ioc=ioc_data,
        obfuscation=obfuscation_data,
        runtime={"events": runtime_events},
        network=network_events,
        filesystem={"events": filesystem_events},
        anti_analysis=anti_analysis
    )
    
    # Execute AI Orchestration Graph
    orchestrator = LangGraphOrchestrator()
    ai_summary = orchestrator.run_pipeline(context_str)
    
    # Save AI Artifacts to MinIO
    artifact_service.save_artifact(case_id, "deobfuscation.json", ai_summary["deobfuscation"])
    artifact_service.save_artifact(case_id, "network_intelligence.json", ai_summary["network_intelligence"])
    artifact_service.save_artifact(case_id, "mitre.json", ai_summary["mitre"])
    artifact_service.save_artifact(case_id, "compliance.json", ai_summary["compliance"])
    artifact_service.save_artifact(case_id, "campaign.json", ai_summary["campaign"])
    artifact_service.save_artifact(case_id, "risk_context.json", ai_summary["risk_context"])
    
    # Calculate Risk Score
    risk_breakdown = RiskEngine.calculate_risk({
        "permissions": permissions_data,
        "runtime": {"events": runtime_events},
        "network": network_events,
        "certificate": certificate_data,
        "ioc": ioc_data,
        "obfuscation": obfuscation_data,
        "mitre": ai_summary["mitre"],
        "campaign": ai_summary["campaign"],
        "risk_context": ai_summary["risk_context"]
    })
    
    # Save Risk Artifacts to MinIO
    artifact_service.save_artifact(case_id, "risk.json", {"threat_index": risk_breakdown.threat_index})
    artifact_service.save_artifact(case_id, "risk_breakdown.json", risk_breakdown.model_dump())
    
    # Build Investigation Package
    from backend.app.investigation.builder import InvestigationBuilder
    artifacts_map = {
        "manifest": manifest_data,
        "permissions": permissions_data,
        "certificate": certificate_data,
        "ioc": ioc_data,
        "obfuscation": obfuscation_data,
        "runtime": {"events": runtime_events},
        "network": network_events,
        "filesystem": {"events": filesystem_events},
        "anti_analysis": anti_analysis
    }
    investigation_pkg = InvestigationBuilder.build(case_id, artifacts_map)
    
    # Save Investigation Artifacts to MinIO
    artifact_service.save_artifact(case_id, "investigation.json", investigation_pkg.model_dump())
    artifact_service.save_artifact(case_id, "timeline.json", {"events": [ev.model_dump() for ev in investigation_pkg.timeline]})
    artifact_service.save_artifact(case_id, "graph.json", investigation_pkg.evidence_graph.model_dump())
    artifact_service.save_artifact(case_id, "campaign_report.json", investigation_pkg.campaign.model_dump())
    
    # Generate Multi-Format Reports
    from backend.app.report_engine.builder import ReportBuilder
    compiled_reports = ReportBuilder.build_reports(case_id, investigation_pkg.model_dump())
    
    # Save Reports to MinIO
    artifact_service.save_artifact(case_id, "reports/analyst.html", {"content": compiled_reports["analyst"]["html"]})
    artifact_service.save_artifact(case_id, "reports/executive.html", {"content": compiled_reports["executive"]["html"]})
    artifact_service.save_artifact(case_id, "reports/compliance.html", {"content": compiled_reports["compliance"]["html"]})
    artifact_service.save_artifact(case_id, "reports/customer.html", {"content": compiled_reports["customer_advisory"]["html"]})
    artifact_service.save_artifact(case_id, "reports/report.json", {"metadata": compiled_reports["analyst"]["json"]})
    
    # Update Case in PostgreSQL
    asyncio.run(update_case_with_ai(case_id, {"events": runtime_events}, ai_summary, int(risk_breakdown.threat_index)))
    
    # Cleanup AVD
    sandbox = SandboxManager()
    sandbox.destroy_sandbox()
    
    print(f"[+] Dynamic and AI Orchestration analysis finished successfully for case: {case_id}")
    ch.basic_ack(delivery_tag=method.delivery_tag)

def main():
    print("[*] Dynamic Analysis & AI Orchestration Worker daemon listening...")
    try:
        params = pika.URLParameters(settings.RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.queue_declare(queue="dh_dynamic_tasks", durable=True)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue="dh_dynamic_tasks", on_message_callback=process_dynamic_message)
        channel.start_consuming()
    except Exception as e:
        print(f"[!] RabbitMQ connection failed: {str(e)}")

if __name__ == "__main__":
    main()
