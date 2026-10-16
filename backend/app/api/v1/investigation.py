from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from backend.app.core.database import get_db
from backend.app.services.case_service import CaseService
from backend.app.investigation.builder import InvestigationBuilder
from backend.app.investigation.schemas import InvestigationPackage

router = APIRouter()

async def get_investigation_data(case_id: UUID, db: AsyncSession) -> InvestigationPackage:
    service = CaseService(db)
    case_obj = await service.get_case(case_id)
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")
        
    artifacts = {
        "manifest": case_obj.manifest_json or {},
        "permissions": case_obj.permissions_json or {},
        "certificate": case_obj.manifest_json or {}, # fallback details
        "ioc": case_obj.evidence_json or {},
        "obfuscation": case_obj.manifest_json or {}, # fallback details
        "runtime": case_obj.runtime_json or {},
        "network": case_obj.network_json or {},
        "filesystem": case_obj.runtime_json or {},
        "anti_analysis": {}
    }
    
    return InvestigationBuilder.build(str(case_id), artifacts)

@router.get("/{case_id}", response_model=InvestigationPackage)
async def get_investigation(case_id: UUID, db: AsyncSession = Depends(get_db)):
    return await get_investigation_data(case_id, db)

@router.get("/{case_id}/timeline")
async def get_timeline(case_id: UUID, db: AsyncSession = Depends(get_db)):
    pkg = await get_investigation_data(case_id, db)
    return pkg.timeline

@router.get("/{case_id}/graph")
async def get_graph(case_id: UUID, db: AsyncSession = Depends(get_db)):
    pkg = await get_investigation_data(case_id, db)
    return pkg.evidence_graph

@router.get("/{case_id}/campaign")
async def get_campaign(case_id: UUID, db: AsyncSession = Depends(get_db)):
    pkg = await get_investigation_data(case_id, db)
    return pkg.campaign

@router.get("/{case_id}/summary")
async def get_summary(case_id: UUID, db: AsyncSession = Depends(get_db)):
    pkg = await get_investigation_data(case_id, db)
    return pkg.summary
