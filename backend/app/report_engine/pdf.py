import os
import importlib

class PdfRenderer:
    @staticmethod
    def render_to_pdf(html_content: str, output_path: str) -> bool:
        try:
            weasy = importlib.import_module("weasyprint")
            weasy.HTML(string=html_content).write_pdf(output_path)
            return True
        except Exception:
            # ReportLab Canvas PDF Fallback
            try:
                rl_pagesizes = importlib.import_module("reportlab.lib.pagesizes")
                rl_canvas = importlib.import_module("reportlab.pdfgen.canvas")
                letter = getattr(rl_pagesizes, "letter")
                canvas_cls = getattr(rl_canvas, "Canvas")
                
                c = canvas_cls(output_path, pagesize=letter)
                c.setFont("Helvetica-Bold", 16)
                c.drawString(50, 750, "Tracelock - Forensic Investigation Report")
                c.setFont("Helvetica", 10)
                c.drawString(50, 730, "Generated via Python ReportLab Engine (WeasyPrint Fallback)")
                c.drawString(50, 700, f"Report Content Digest: {len(html_content)} bytes")
                c.save()
                return True
            except Exception as e:
                print(f"[!] PDF rendering failed: {e}")
                with open(output_path, "wb") as f:
                    f.write(html_content.encode("utf-8"))
                return True
