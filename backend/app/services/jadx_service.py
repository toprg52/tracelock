import subprocess
import os
import shutil
import zipfile
import re

class JadxService:
    @staticmethod
    def decompile(apk_path: str, output_dir: str) -> bool:
        if not shutil.which("jadx"):
            # JADX is not installed. Fallback to extracting text contents from APK assets for static parsing
            return False
            
        try:
            cmd = ["jadx", "-d", output_dir, apk_path]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            return result.returncode == 0
        except Exception:
            return False

    @staticmethod
    def extract_strings_fallback(apk_path: str) -> list[str]:
        # Fallback string list extractor directly from binary resources
        strings = []
        try:
            with zipfile.ZipFile(apk_path) as zf:
                for filename in zf.namelist():
                    if filename.endswith(".dex"):
                        data = zf.read(filename)
                        # Extract ascii sequences longer than 4 chars
                        found = re.findall(b"[a-zA-Z0-9_/.-]{4,100}", data)
                        strings.extend([f.decode('ascii', errors='ignore') for f in found])
        except Exception:
            pass
        return list(set(strings))
