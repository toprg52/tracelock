import zipfile
import os
from typing import Tuple

class ApkValidator:
    @staticmethod
    def validate(file_path: str) -> Tuple[bool, str]:
        # Validate file size (max 200MB)
        size_limit = 200 * 1024 * 1024
        if os.path.getsize(file_path) > size_limit:
            return False, "File exceeds maximum size limit of 200MB"

        # Validate ZIP integrity
        if not zipfile.is_zipfile(file_path):
            return False, "Uploaded file is not a valid zip archive (APK)"
            
        try:
            with zipfile.ZipFile(file_path) as zf:
                # Check for AndroidManifest.xml inside APK
                if "AndroidManifest.xml" not in zf.namelist():
                    return False, "Invalid APK: AndroidManifest.xml is missing"
                # Test zip file integrity
                corrupt_file = zf.testzip()
                if corrupt_file is not None:
                    return False, f"Corrupted APK file structure at: {corrupt_file}"
        except Exception as e:
            return False, f"Failed to open zip file structure: {str(e)}"
            
        return True, "Valid APK"
