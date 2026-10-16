from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "services": {
            "database": "online",
            "redis": "online",
            "rabbitmq": "online",
            "workers": "online",
            "ai_models": "online"
        }
    }

@router.get("/metrics")
def metrics():
    # Mock prometheus metrics
    return "# HELP request_count Total request count\n# TYPE request_count counter\nrequest_count 42"
