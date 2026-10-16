from jinja2 import Template
from backend.app.report_engine.templates import ReportTemplates
from backend.app.report_engine.schemas import ReportContext

class HtmlRenderer:
    @staticmethod
    def render(context: ReportContext) -> str:
        # Load layout based on type
        t_type = context.report_type
        if t_type == "analyst":
            t_str = ReportTemplates.ANALYST
        elif t_type == "executive":
            t_str = ReportTemplates.EXECUTIVE
        elif t_type == "compliance":
            t_str = ReportTemplates.COMPLIANCE
        else:
            t_str = ReportTemplates.CUSTOMER
            
        template = Template(t_str)
        return template.render(context.model_dump())
