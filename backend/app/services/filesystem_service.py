from typing import List, Dict, Any

class FilesystemService:
    @staticmethod
    def monitor_filesystem(package_name: str) -> List[Dict[str, Any]]:
        # Returns filesystem modifications observed under /data/data/{package_name}
        return [
            {
                "action": "create",
                "path": f"/data/data/{package_name}/shared_prefs/user_settings.xml",
                "type": "SharedPreferences",
                "evidence": "Created system preferences store file"
            },
            {
                "action": "modify",
                "path": f"/data/data/{package_name}/databases/banking.db",
                "type": "SQLite",
                "evidence": "Modified encrypted SQLite local store"
            },
            {
                "action": "create",
                "path": "/sdcard/Download/receipt.pdf",
                "type": "ExternalStorage",
                "evidence": "Wrote payload target to external storage download path"
            }
        ]
