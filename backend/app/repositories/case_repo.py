from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from backend.app.repositories.base import BaseRepository
from backend.app.models.models import Case

class CaseRepository(BaseRepository[Case]):
    def __init__(self, session: AsyncSession):
        super().__init__(Case, session)

    async def get_by_sha256(self, sha256: str) -> Optional[Case]:
        query = select(Case).filter(Case.sha256 == sha256)
        result = await self.session.execute(query)
        return result.scalars().first()
