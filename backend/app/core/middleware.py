import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from backend.app.core.logging_config import logger

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id
        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        
        request_id = getattr(request.state, "request_id", "N/A")
        user_id = getattr(request.state, "user_id", "anonymous")
        case_id = request.path_params.get("case_id", "N/A")
        
        logger.info(
            f"{request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "user_id": str(user_id),
                "case_id": str(case_id),
                "latency": f"{process_time:.2f}ms",
                "status_code": response.status_code
            }
        )
        return response

class ExceptionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            request_id = getattr(request.state, "request_id", "N/A")
            logger.error(
                f"Unhandled Exception: {str(exc)}",
                extra={
                    "request_id": request_id,
                    "status_code": 500
                }
            )
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An unexpected error occurred."
                    }
                }
            )
