import json
from backend.app.report_engine.schemas import ReportContext

class JsonExporter:
    @staticmethod
    def export(context: ReportContext) -> str:
        return json.dumps(context.model_dump(), indent=2)
