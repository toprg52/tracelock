import os
import asyncio
from fastapi import APIRouter
from sqlalchemy import text
from backend.app.core.config import settings
from backend.app.core.database import engine

router = APIRouter()

async def check_postgres() -> str:
    try:
        async with asyncio.timeout(2.5):
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
        return "ok"
    except Exception:
        return "unreachable"

async def check_redis() -> str:
    try:
        import redis.asyncio as aioredis
        async with asyncio.timeout(2.5):
            client = aioredis.from_url(settings.REDIS_URL, socket_connect_timeout=2)
            await client.ping()
            await client.aclose()
        return "ok"
    except Exception:
        return "unreachable"

def _check_rabbitmq_sync() -> str:
    try:
        import pika
        params = pika.URLParameters(settings.RABBITMQ_URL)
        params.socket_timeout = 2
        conn = pika.BlockingConnection(params)
        conn.close()
        return "ok"
    except Exception:
        return "unreachable"

async def check_rabbitmq() -> str:
    try:
        async with asyncio.timeout(2.5):
            return await asyncio.to_thread(_check_rabbitmq_sync)
    except Exception:
        return "unreachable"

def _check_neo4j_sync() -> str:
    try:
        from neo4j import GraphDatabase
        url = os.environ.get("NEO4J_URL", "bolt://localhost:7687")
        user = os.environ.get("NEO4J_USER", "neo4j")
        password = os.environ.get("NEO4J_PASSWORD")
        driver = GraphDatabase.driver(
            url,
            auth=(user, password) if password else None,
            connection_timeout=2
        )
        driver.verify_connectivity()
        driver.close()
        return "ok"
    except Exception:
        return "unreachable"

async def check_neo4j() -> str:
    try:
        async with asyncio.timeout(2.5):
            return await asyncio.to_thread(_check_neo4j_sync)
    except Exception:
        return "unreachable"

def _check_minio_sync() -> str:
    try:
        from minio import Minio
        endpoint = settings.MINIO_ENDPOINT.replace("http://", "").replace("https://", "")
        client = Minio(
            endpoint,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False
        )
        client.bucket_exists("artifacts")
        return "ok"
    except Exception:
        return "unreachable"

async def check_minio() -> str:
    try:
        async with asyncio.timeout(2.5):
            return await asyncio.to_thread(_check_minio_sync)
    except Exception:
        return "unreachable"

def check_gemini() -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key or key == "your_gemini_key_here" or key.startswith("your_") or key == "placeholder":
        return "not_configured"
    return "ok"

def check_ethereum() -> str:
    addr = (
        os.environ.get("VITE_CONTRACT_ADDRESS")
        or os.environ.get("CONTRACT_ADDRESS")
        or ""
    ).strip()
    rpc = (
        os.environ.get("ETHEREUM_RPC_URL")
        or os.environ.get("WEB3_PROVIDER_URI")
        or ""
    ).strip()
    if not addr and not rpc:
        return "not_configured"
    if addr in ("0x0000000000000000000000000000000000000000", "0x0"):
        return "not_configured"
    return "ok"

@router.get("/health")
async def health_check():
    # Run infrastructure connectivity checks concurrently
    pg_res, redis_res, rmq_res, neo4j_res, minio_res = await asyncio.gather(
        check_postgres(),
        check_redis(),
        check_rabbitmq(),
        check_neo4j(),
        check_minio(),
        return_exceptions=False
    )

    gemini_res = check_gemini()
    eth_res = check_ethereum()

    services = {
        "postgres": pg_res,
        "redis": redis_res,
        "rabbitmq": rmq_res,
        "neo4j": neo4j_res,
        "minio": minio_res,
        "gemini": gemini_res,
        "ethereum": eth_res,
    }

    core_services = [pg_res, redis_res, rmq_res, neo4j_res, minio_res]
    is_healthy = all(s == "ok" for s in core_services)

    return {
        "status": "ok" if is_healthy else "degraded",
        "services": services
    }

@router.get("/metrics")
def metrics():
    # Mock prometheus metrics
    return "# HELP request_count Total request count\n# TYPE request_count counter\nrequest_count 42"

