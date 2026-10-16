from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from backend.app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def run_startup_migrations():
    """Adds new columns if they don't exist yet. Safe to run on every startup —
    each statement is a no-op if the column is already there. This avoids
    needing direct DB console access for small schema additions."""
    async with engine.begin() as conn:
        dialect = conn.dialect.name
        if dialect == "sqlite":
            res = await conn.execute(text("PRAGMA table_info(cases)"))
            existing_cols = {row[1] for row in res.fetchall()}
            if "blockchain_tx_hash" not in existing_cols:
                await conn.execute(text("ALTER TABLE cases ADD COLUMN blockchain_tx_hash VARCHAR"))
            if "blockchain_block" not in existing_cols:
                await conn.execute(text("ALTER TABLE cases ADD COLUMN blockchain_block INTEGER"))
            if "blockchain_timestamp" not in existing_cols:
                await conn.execute(text("ALTER TABLE cases ADD COLUMN blockchain_timestamp TIMESTAMP"))
        else:
            await conn.execute(text("ALTER TABLE cases ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR"))
            await conn.execute(text("ALTER TABLE cases ADD COLUMN IF NOT EXISTS blockchain_block INTEGER"))
            await conn.execute(text("ALTER TABLE cases ADD COLUMN IF NOT EXISTS blockchain_timestamp TIMESTAMP"))

