from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import Optional
from datetime import date

from app.database import get_session
from app.modules.environmental.schemas import (
    EmissionFactorCreate,
    EmissionFactorUpdate,
    EmissionFactorRead,
    ProductESGProfileCreate,
    ProductESGProfileUpdate,
    ProductESGProfileRead,
    EnvironmentalGoalCreate,
    EnvironmentalGoalUpdate,
    EnvironmentalGoalRead,
    CarbonTransactionCreate,
    CarbonTransactionRead,
    GroupByEnum,
    DashboardResponse,
)
from app.modules.environmental import service

router = APIRouter(prefix="/environmental", tags=["Environmental Module"])


# ── Emission Factors ─────────────────────────────────────────────

@router.get("/factors", response_model=list[EmissionFactorRead])
def list_factors(
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    return service.list_factors(session, status)


@router.post("/factors", response_model=EmissionFactorRead, status_code=201)
def create_factor(
    data: EmissionFactorCreate,
    session: Session = Depends(get_session),
):
    return service.create_factor(session, data)


@router.get("/factors/{factor_id}", response_model=EmissionFactorRead)
def get_factor(
    factor_id: int,
    session: Session = Depends(get_session),
):
    factor = service.get_factor(session, factor_id)
    if not factor:
        raise HTTPException(status_code=404, detail="Emission factor not found")
    return factor


@router.put("/factors/{factor_id}", response_model=EmissionFactorRead)
def update_factor(
    factor_id: int,
    data: EmissionFactorUpdate,
    session: Session = Depends(get_session),
):
    factor = service.update_factor(session, factor_id, data)
    if not factor:
        raise HTTPException(status_code=404, detail="Emission factor not found")
    return factor


@router.delete("/factors/{factor_id}", status_code=204)
def delete_factor(
    factor_id: int,
    session: Session = Depends(get_session),
):
    if not service.delete_factor(session, factor_id):
        raise HTTPException(status_code=404, detail="Emission factor not found")


# ── Product ESG Profiles ─────────────────────────────────────────

@router.get("/products", response_model=list[ProductESGProfileRead])
def list_products(
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    return service.list_products(session, status)


@router.post("/products", response_model=ProductESGProfileRead, status_code=201)
def create_product(
    data: ProductESGProfileCreate,
    session: Session = Depends(get_session),
):
    return service.create_product(session, data)


@router.get("/products/{product_id}", response_model=ProductESGProfileRead)
def get_product(
    product_id: int,
    session: Session = Depends(get_session),
):
    product = service.get_product(session, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product ESG profile not found")
    return product


@router.put("/products/{product_id}", response_model=ProductESGProfileRead)
def update_product(
    product_id: int,
    data: ProductESGProfileUpdate,
    session: Session = Depends(get_session),
):
    product = service.update_product(session, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product ESG profile not found")
    return product


@router.delete("/products/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    session: Session = Depends(get_session),
):
    if not service.delete_product(session, product_id):
        raise HTTPException(status_code=404, detail="Product ESG profile not found")


# ── Environmental Goals ──────────────────────────────────────────

@router.get("/goals", response_model=list[EnvironmentalGoalRead])
def list_goals(
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    return service.list_goals(session, status)


@router.post("/goals", response_model=EnvironmentalGoalRead, status_code=201)
def create_goal(
    data: EnvironmentalGoalCreate,
    session: Session = Depends(get_session),
):
    return service.create_goal(session, data)


@router.get("/goals/{goal_id}", response_model=EnvironmentalGoalRead)
def get_goal(
    goal_id: int,
    session: Session = Depends(get_session),
):
    goal = service.get_goal(session, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Environmental goal not found")
    return goal


@router.put("/goals/{goal_id}", response_model=EnvironmentalGoalRead)
def update_goal(
    goal_id: int,
    data: EnvironmentalGoalUpdate,
    session: Session = Depends(get_session),
):
    goal = service.update_goal(session, goal_id, data)
    if not goal:
        raise HTTPException(status_code=404, detail="Environmental goal not found")
    return goal


@router.delete("/goals/{goal_id}", status_code=204)
def delete_goal(
    goal_id: int,
    session: Session = Depends(get_session),
):
    if not service.delete_goal(session, goal_id):
        raise HTTPException(status_code=404, detail="Environmental goal not found")


# ── Carbon Transactions ──────────────────────────────────────────

@router.post("/transactions", response_model=CarbonTransactionRead, status_code=201)
def log_transaction(
    data: CarbonTransactionCreate,
    session: Session = Depends(get_session),
):
    return service.log_transaction(session, data)


# ── Dashboard ────────────────────────────────────────────────────

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    department_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    group_by: GroupByEnum = Query(GroupByEnum.month),
    session: Session = Depends(get_session),
):
    return service.get_dashboard_data(session, department_id, start_date, end_date, group_by.value)
