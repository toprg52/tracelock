from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from backend.app.core.database import get_db
from backend.app.services.case_service import CaseService

router = APIRouter()


class CaseResponse(BaseModel):
    id: UUID
    case_number: str
    sha256: str
    filename: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class VerifyAnchorRequest(BaseModel):
    tx_hash: str


@router.get("", response_model=List[CaseResponse])
async def get_cases(
    page: int = 1,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    service = CaseService(db)
    offset = (page - 1) * limit
    return await service.list_cases(skip=offset, limit=limit)


@router.get("/{case_id}")
async def get_case(case_id: UUID, db: AsyncSession = Depends(get_db)):
    # Check artifact storage for saved payload
    from backend.app.services.artifact_service import ArtifactService
    art_service = ArtifactService()
    try:
        if art_service.use_fallback:
            import os, json
            path = os.path.join("local_artifacts", str(case_id), "case_payload.json")
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
    except Exception:
        pass
    service = CaseService(db)
    case_obj = await service.get_case(case_id)
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")

    if case_obj.evidence_json and isinstance(case_obj.evidence_json, dict) and "full_payload" in case_obj.evidence_json:
        return case_obj.evidence_json["full_payload"]
    return {
        "id": str(case_obj.id),
        "case_number": case_obj.case_number,
        "sha256": case_obj.sha256,
        "filename": case_obj.filename,
        "status": case_obj.status,
        "created_at": case_obj.created_at.isoformat() if case_obj.created_at else None
    }


@router.post("/{case_id}/reanalyze")
async def reanalyze_case(case_id: UUID, db: AsyncSession = Depends(get_db)):
    service = CaseService(db)
    case_obj = await service.get_case(case_id)
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")

    case_obj.status = "queued"
    await db.commit()
    return {"success": True, "message": "Reanalysis job queued"}


@router.delete("/{case_id}")
async def delete_case(case_id: UUID, db: AsyncSession = Depends(get_db)):
    service = CaseService(db)
    case_obj = await service.get_case(case_id)
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")

    await service.repo.delete(case_obj)
    return {"success": True, "message": "Case deleted successfully"}


@router.post("/{case_id}/verify-anchor")
async def verify_anchor(case_id: UUID, body: VerifyAnchorRequest, db: AsyncSession = Depends(get_db)):
    """Independently verifies a MetaMask-signed anchor tx against live Sepolia data,
    then stores the result on the case. Never trusts the frontend's claim alone —
    BlockchainAnchor.verify_anchor() re-reads the chain itself."""
    service = CaseService(db)
    case_obj = await service.get_case(case_id)
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")

    # Pull the same report content the frontend hashed and anchored
    report_text = None
    if case_obj.evidence_json and isinstance(case_obj.evidence_json, dict):
        report_text = case_obj.evidence_json.get("analystReport") or case_obj.evidence_json.get("full_payload")
    if report_text is None:
        report_text = f"{case_obj.case_number}:{case_obj.sha256}"
    if isinstance(report_text, dict):
        import json
        report_text = json.dumps(report_text)
    report_bytes = report_text.encode("utf-8")

    from backend.app.blockchain.anchor_service import BlockchainAnchor, AnchorVerificationError

    try:
        anchor = BlockchainAnchor()
        result = anchor.verify_anchor(
            tx_hash=body.tx_hash,
            case_id=str(case_obj.id),
            report_bytes=report_bytes,
        )
    except AnchorVerificationError as e:
        raise HTTPException(status_code=422, detail=str(e))

    await service.update_blockchain_anchor(
        case_id=case_obj.id,
        tx_hash=result["tx_hash"],
        block_number=result["block_number"],
        timestamp=datetime.utcnow(),
    )

    return result
