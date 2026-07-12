from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session
from app.modules.reports.models import ReportFilter

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.post("/environmental")
def get_environmental_report(filters: ReportFilter, session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent F
    return {"message": "Environmental report data skeleton"}

@router.post("/social")
def get_social_report(filters: ReportFilter, session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent F
    return {"message": "Social report data skeleton"}

@router.post("/governance")
def get_governance_report(filters: ReportFilter, session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent F
    return {"message": "Governance report data skeleton"}

@router.post("/summary")
def get_esg_summary_report(filters: ReportFilter, session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent F
    return {"message": "ESG Summary report data skeleton"}

@router.post("/export/{format}")
def export_custom_report(format: str, filters: ReportFilter, session: Session = Depends(get_session)):
    # SKELETON: format should be "pdf", "excel", or "csv"
    # To be implemented by Agent F
    return {"message": f"Export custom report in {format} format skeleton"}
