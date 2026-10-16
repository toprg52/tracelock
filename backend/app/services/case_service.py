from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.repositories.case_repo import CaseRepository
from backend.app.models.models import Case
import uuid

class CaseService:
    def __init__(self, session: AsyncSession):
        self.repo = CaseRepository(session)

    async def get_case(self, case_id: uuid.UUID) -> Case:
        return await self.repo.get(case_id)

    async def list_cases(self, skip: int = 0, limit: int = 100):
        return await self.repo.get_all(skip, limit)

    async def create_case(self, filename: str, sha256: str) -> Case:
        case = Case(
            id=uuid.uuid4(),
            case_number=f"BC-{uuid.uuid4().hex[:6].upper()}",
            filename=filename,
            sha256=sha256,
            status="queued"
        )
        return await self.repo.create(case)

    async def update_blockchain_anchor(self, case_id: uuid.UUID, tx_hash: str, block_number: int, timestamp) -> Case:
        case = await self.repo.get(case_id)
        if not case:
            return None
        case.blockchain_tx_hash = tx_hash
        case.blockchain_block = block_number
        case.blockchain_timestamp = timestamp
        await self.repo.session.commit()
        await self.repo.session.refresh(case)
        return case

