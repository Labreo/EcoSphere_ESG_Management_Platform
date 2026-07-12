from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session

router = APIRouter(prefix="/settings", tags=["Settings & Administration"])

@router.get("/config")
def get_system_config(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent F
    return {"message": "Get global ESG configuration skeleton"}

@router.patch("/config")
def update_system_config(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent F
    return {"message": "Update global ESG configuration skeleton"}

@router.get("/categories")
def list_categories(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent F
    return {"message": "List category master data skeleton"}

@router.post("/categories")
def create_category(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent F
    return {"message": "Create category master data skeleton"}
