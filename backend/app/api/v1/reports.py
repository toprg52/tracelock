from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from backend.app.core.database import get_db
from backend.app.services.case_service import CaseService
from backend.app.report_engine.builder import ReportBuilder
from backend.app.investigation.builder import InvestigationBuilder

router = APIRouter()

async def compile_case_reports(case_id: UUID, db: AsyncSession) -> dict:
    service = CaseService(db)
    case_obj = await service.get_case(case_id)
    if not case_obj:
        raise HTTPException(status_code=404, detail="Case not found")
        
    artifacts = {
        "manifest": case_obj.manifest_json or {},
        "permissions": case_obj.permissions_json or {},
        "certificate": case_obj.manifest_json or {},
        "ioc": case_obj.evidence_json or {},
        "obfuscation": case_obj.manifest_json or {},
        "runtime": case_obj.runtime_json or {},
        "network": case_obj.network_json or {},
        "filesystem": case_obj.runtime_json or {},
        "anti_analysis": {}
    }
    
    investigation_pkg = InvestigationBuilder.build(str(case_id), artifacts)
    reports = ReportBuilder.build_reports(str(case_id), investigation_pkg.model_dump())
    return reports

@router.get("/{case_id}")
async def get_reports(case_id: UUID, db: AsyncSession = Depends(get_db)):
    reports = await compile_case_reports(case_id, db)
    return {
        "success": True,
        "reports": [
            {"report_type": r_type, "hash": r_data["hash"]}
            for r_type, r_data in reports.items()
        ]
    }

@router.get("/{case_id}/download")
async def download_report(case_id: UUID, report_type: str = "analyst", db: AsyncSession = Depends(get_db)):
    reports = await compile_case_reports(case_id, db)
    if report_type not in reports:
        raise HTTPException(status_code=404, detail="Selected report type not found")
    return {
        "success": True,
        "html_content": reports[report_type]["html"],
        "hash": reports[report_type]["hash"]
    }

@router.get("/{case_id}/json")
async def get_report_json(case_id: UUID, report_type: str = "analyst", db: AsyncSession = Depends(get_db)):
    reports = await compile_case_reports(case_id, db)
    if report_type not in reports:
        raise HTTPException(status_code=404, detail="Selected report type not found")
    return {
        "success": True,
        "json_data": reports[report_type]["json"]
    }

@router.post("/{case_id}/regenerate")
async def regenerate_reports(case_id: UUID, db: AsyncSession = Depends(get_db)):
    await compile_case_reports(case_id, db)
    return {"success": True, "message": "Reports regenerated successfully"}

from backend.app.core.security import RoleChecker

@router.get("/report/{case_id}/technical")
async def get_technical_report(case_id: UUID, db: AsyncSession = Depends(get_db), user: dict = Depends(RoleChecker(["analyst", "admin"]))):
    reports = await compile_case_reports(case_id, db)
    return {
        "success": True,
        "html_content": reports.get("analyst", {}).get("html", ""),
        "hash": reports.get("analyst", {}).get("hash", "")
    }

@router.get("/report/{case_id}/executive")
async def get_executive_report(case_id: UUID, db: AsyncSession = Depends(get_db), user: dict = Depends(RoleChecker(["officer", "admin"]))):
    reports = await compile_case_reports(case_id, db)
    return {
        "success": True,
        "html_content": reports.get("executive", {}).get("html", ""),
        "hash": reports.get("executive", {}).get("hash", "")
    }
