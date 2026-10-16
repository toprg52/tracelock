from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from backend.app.core.database import get_db
from backend.app.services.case_service import CaseService
from backend.app.risk_engine.engine import RiskEngine
from backend.app.risk_engine.schemas import RiskBreakdown

router = APIRouter()

@router.get("/{case_id}", response_model=RiskBreakdown)
async def get_risk_assessment(case_id: UUID, db: AsyncSession = Depends(get_db)):
    service = CaseService(db)
    case_obj = await service.get_case(case_id)
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Re-evaluate from case JSON fields to generate breakdown response
    artifacts = {
        "permissions": case_obj.permissions_json or {},
        "runtime": case_obj.runtime_json or {},
        "network": case_obj.network_json or {},
        "certificate": case_obj.manifest_json or {}, # fallback details
        "ioc": case_obj.evidence_json or {},
        "obfuscation": case_obj.manifest_json or {}, # fallback details
        "mitre": case_obj.threatNarrative.get("mitre") if case_obj.threatNarrative else {},
        "campaign": case_obj.threatNarrative.get("campaign") if case_obj.threatNarrative else {},
        "risk_context": case_obj.threatNarrative.get("risk_context") if case_obj.threatNarrative else {}
    }
    
    return RiskEngine.calculate_risk(artifacts)

@router.get("/{case_id}/breakdown")
async def get_risk_breakdown(case_id: UUID, db: AsyncSession = Depends(get_db)):
    return await get_risk_assessment(case_id, db)

@router.get("/{case_id}/history")
async def get_risk_history(case_id: UUID, db: AsyncSession = Depends(get_db)):
    return {
        "case_id": str(case_id),
        "history": [
            {"formula_version": "1.0", "weight_version": "1.0", "threat_index": 74.0, "generated_at": "2026-07-09"}
        ]
    }
