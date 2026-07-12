from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session

router = APIRouter(prefix="/social", tags=["Social Module"])

@router.get("/activities")
def list_activities(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent C
    return {"message": "List CSR activities skeleton"}

@router.post("/activities")
def create_activity(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent C
    return {"message": "Create CSR activity skeleton"}

@router.post("/activities/{id}/join")
def join_activity(id: int, session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent C
    return {"message": f"Join CSR activity {id} skeleton"}

@router.post("/activities/{id}/submit-proof")
def submit_activity_proof(id: int, session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent C
    return {"message": f"Submit proof for CSR activity {id} skeleton"}

@router.post("/participations/{id}/approve")
def approve_participation(id: int, session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent C (Includes Evidence Requirement toggle check & points award)
    return {"message": f"Approve participation {id} skeleton"}

@router.get("/diversity-metrics")
def get_diversity_metrics(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent C
    return {"message": "Get diversity metrics skeleton"}
