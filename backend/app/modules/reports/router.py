from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_session
from app.modules.reports.models import ReportFilter
from app.modules.reports.service import (
    get_environmental_data,
    get_social_data,
    get_governance_data,
    get_esg_summary,
    export_report_csv,
)

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


@router.post("/environmental")
def environmental_report(filters: ReportFilter, session: Session = Depends(get_session)):
    return get_environmental_data(session, filters)


@router.post("/social")
def social_report(filters: ReportFilter, session: Session = Depends(get_session)):
    return get_social_data(session, filters)


@router.post("/governance")
def governance_report(filters: ReportFilter, session: Session = Depends(get_session)):
    return get_governance_data(session, filters)


@router.post("/summary")
def esg_summary_report(filters: ReportFilter, session: Session = Depends(get_session)):
    return get_esg_summary(session, filters)


@router.post("/export/{format}")
def export_report(format: str, filters: ReportFilter, session: Session = Depends(get_session)):
    if format not in ("csv", "pdf"):
        raise HTTPException(status_code=400, detail="Unsupported format. Use 'csv' or 'pdf'.")

    data = get_esg_summary(session, filters)

    if format == "csv":
        return export_report_csv(data, filename="esg_summary_report.csv")

    return {"message": "PDF export not yet implemented. Use CSV format instead."}
