from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, timezone, timedelta
import json
from backend.app.core.database import get_db
from backend.app.services.case_service import CaseService
from backend.app.models.models import Case

router = APIRouter()


class CaseResponse(BaseModel):
    id: UUID
    case_number: str
    sha256: str
    filename: str
    status: str
    created_at: datetime
    risk_score: Optional[int] = None
    verdict: Optional[str] = None

    class Config:
        from_attributes = True


class RiskTrendItem(BaseModel):
    date: str
    avg_risk: float
    count: int


class CaseStatsResponse(BaseModel):
    total_cases: int
    critical_cases: int  # Risk >= 80
    high_cases: int      # Risk 60 to 79 (non-overlapping with critical)
    average_risk_score: float
    active_iocs: int
    risk_trend: List[RiskTrendItem]


class VerifyAnchorRequest(BaseModel):
    tx_hash: str


def extract_case_details(case_obj: Case) -> tuple[Optional[int], Optional[str]]:
    risk_score = None
    verdict = None
    if case_obj.evidence_json and isinstance(case_obj.evidence_json, dict):
        fp = case_obj.evidence_json.get("full_payload")
        if isinstance(fp, dict):
            risk_score = fp.get("riskScore") if fp.get("riskScore") is not None else fp.get("risk_score")
            verdict = fp.get("threatFamily") or fp.get("malwareType") or fp.get("verdict")
        else:
            risk_score = case_obj.evidence_json.get("riskScore") or case_obj.evidence_json.get("risk_score")
            verdict = case_obj.evidence_json.get("threatFamily") or case_obj.evidence_json.get("malwareType") or case_obj.evidence_json.get("verdict")
    return risk_score, verdict


@router.get("", response_model=List[CaseResponse])
async def get_cases(
    page: int = 1,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    service = CaseService(db)
    offset = (page - 1) * limit
    case_objs = await service.list_cases(skip=offset, limit=limit)
    response_items = []
    for c in case_objs:
        risk, verdict = extract_case_details(c)
        response_items.append(
            CaseResponse(
                id=c.id,
                case_number=c.case_number,
                sha256=c.sha256,
                filename=c.filename,
                status=c.status,
                created_at=c.created_at,
                risk_score=risk,
                verdict=verdict,
            )
        )
    return response_items


@router.get("/stats", response_model=CaseStatsResponse)
async def get_case_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Case))
    all_cases = list(result.scalars().all())

    total_cases = len(all_cases)
    if total_cases == 0:
        return CaseStatsResponse(
            total_cases=0,
            critical_cases=0,
            high_cases=0,
            average_risk_score=0.0,
            active_iocs=0,
            risk_trend=[],
        )

    critical_cases = 0
    high_cases = 0
    scores = []
    unique_iocs = set()
    now = datetime.now(timezone.utc)
    cutoff_14d = now - timedelta(days=14)
    daily_risks: dict[str, list[int]] = {}

    for case in all_cases:
        risk, _ = extract_case_details(case)
        if risk is not None:
            scores.append(risk)
            if risk >= 80:
                critical_cases += 1
            elif risk >= 60:
                high_cases += 1

        # Extract distinct IOCs from evidence_json
        if case.evidence_json and isinstance(case.evidence_json, dict):
            iocs = case.evidence_json.get("iocs")
            if isinstance(iocs, list):
                for ioc in iocs:
                    if isinstance(ioc, dict) and "value" in ioc:
                        unique_iocs.add(ioc["value"])
                    elif isinstance(ioc, str):
                        unique_iocs.add(ioc)
            fp = case.evidence_json.get("full_payload")
            if isinstance(fp, dict) and "iocs" in fp:
                fp_iocs = fp["iocs"]
                if isinstance(fp_iocs, str):
                    try:
                        parsed_iocs = json.loads(fp_iocs)
                        for item in parsed_iocs:
                            if isinstance(item, dict) and "value" in item:
                                unique_iocs.add(item["value"])
                    except Exception:
                        pass
                elif isinstance(fp_iocs, list):
                    for item in fp_iocs:
                        if isinstance(item, dict) and "value" in item:
                            unique_iocs.add(item["value"])

        # Group by day for the last 14 days
        if case.created_at and risk is not None:
            created_dt = case.created_at
            if created_dt.tzinfo is None:
                created_dt = created_dt.replace(tzinfo=timezone.utc)
            if created_dt >= cutoff_14d:
                day_str = created_dt.strftime("%Y-%m-%d")
                daily_risks.setdefault(day_str, []).append(risk)

    avg_risk = round(sum(scores) / len(scores), 1) if scores else 0.0

    risk_trend = []
    for day_str in sorted(daily_risks.keys()):
        day_scores = daily_risks[day_str]
        risk_trend.append(
            RiskTrendItem(
                date=day_str,
                avg_risk=round(sum(day_scores) / len(day_scores), 1),
                count=len(day_scores),
            )
        )

    return CaseStatsResponse(
        total_cases=total_cases,
        critical_cases=critical_cases,
        high_cases=high_cases,
        average_risk_score=avg_risk,
        active_iocs=len(unique_iocs),
        risk_trend=risk_trend,
    )


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
