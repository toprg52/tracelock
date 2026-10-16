from datetime import datetime, timezone
from backend.app.report_engine.schemas import ReportContext
from backend.app.report_engine.branding import BrandingManager
from backend.app.report_engine.signatures import IntegritySigner
from backend.app.report_engine.html import HtmlRenderer
from backend.app.report_engine.pdf import PdfRenderer
from backend.app.report_engine.json_export import JsonExporter

class ReportBuilder:
    @staticmethod
    def build_reports(case_id: str, investigation_data: dict) -> dict:
        reports = {}
        branding = BrandingManager.get_branding()
        
        # We generate Analyst, Executive, and Compliance reports
        types = ["analyst", "executive", "compliance", "customer_advisory"]
        
        for t in types:
            context = ReportContext(
                case_id=case_id,
                report_type=t,
                title=f"{t.upper()} Threat Intelligence Report",
                generated_at=datetime.now(timezone.utc).isoformat(),
                confidentiality_label="CONFIDENTIAL // INTERNAL USE ONLY",
                branding=branding,
                investigation_data=investigation_data
            )
            
            # Sign report
            raw_json = JsonExporter.export(context)
            integrity_hash = IntegritySigner.compute_sha256(raw_json)
            context.integrity_hash = integrity_hash
            
            html_content = HtmlRenderer.render(context)
            
            reports[t] = {
                "context": context,
                "html": html_content,
                "json": JsonExporter.export(context),
                "hash": integrity_hash
            }
            
        return reports
