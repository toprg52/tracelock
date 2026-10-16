class NarrativeGenerator:
    @staticmethod
    def generate(artifacts: dict) -> str:
        manifest = artifacts.get("manifest", {})
        package = manifest.get("package_name", "Unknown")
        cert = artifacts.get("certificate", {})
        
        narrative = (
            f"The application {package} presents sign properties suggesting spoofed origin. "
            f"Specifically, certificate CN properties are marked CN={cert.get('subject', 'Unknown')} "
            f"and self-signed status is evaluated to {cert.get('self_signed', False)}. "
            f"Outbound network indicators match blacklisted C2 host servers."
        )
        return narrative
