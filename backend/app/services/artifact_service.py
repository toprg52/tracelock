import json
import os
from minio import Minio
from backend.app.core.config import settings

class ArtifactService:
    def __init__(self):
        # Fallback to local file storage if MinIO credentials aren't accessible or fail to connect
        self.use_fallback = False
        try:
            # Strip protocol for Minio endpoint
            endpoint = settings.MINIO_ENDPOINT.replace("http://", "").replace("https://", "")
            self.client = Minio(
                endpoint,
                access_key=settings.MINIO_ACCESS_KEY,
                secret_key=settings.MINIO_SECRET_KEY,
                secure=False
            )
            # Create buckets
            if not self.client.bucket_exists("artifacts"):
                self.client.make_bucket("artifacts")
        except Exception:
            self.use_fallback = True
            os.makedirs("local_artifacts", exist_ok=True)

    def save_artifact(self, case_id: str, artifact_name: str, data: dict) -> str:
        content = json.dumps(data, indent=2)
        object_key = f"{case_id}/{artifact_name}"
        
        if self.use_fallback:
            path = os.path.join("local_artifacts", case_id)
            os.makedirs(path, exist_ok=True)
            with open(os.path.join(path, artifact_name), "w") as f:
                f.write(content)
            return object_key

        try:
            from io import BytesIO
            bytes_data = content.encode("utf-8")
            self.client.put_object(
                "artifacts",
                object_key,
                BytesIO(bytes_data),
                length=len(bytes_data),
                content_type="application/json"
            )
            return object_key
        except Exception:
            # Fallback on runtime connection failure
            path = os.path.join("local_artifacts", case_id)
            os.makedirs(path, exist_ok=True)
            with open(os.path.join(path, artifact_name), "w") as f:
                f.write(content)
            return object_key
SettingValues = {}
