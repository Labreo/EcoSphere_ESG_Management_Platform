from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session

router = APIRouter(prefix="/environmental", tags=["Environmental Module"])

@router.get("/factors")
def list_factors(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent B
    return {"message": "List emission factors skeleton"}

@router.post("/factors")
def create_factor(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent B
    return {"message": "Create emission factor skeleton"}

@router.get("/products")
def list_products(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent B
    return {"message": "List products ESG profiles skeleton"}

@router.post("/transactions")
def log_carbon_transaction(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent B (Includes Auto Emission Calculation logic)
    return {"message": "Log carbon transaction skeleton"}

@router.get("/dashboard")
def get_environmental_dashboard(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent B
    return {"message": "Get environmental dashboard skeleton"}
