from sqlmodel import Session, select
from sqlalchemy import func
from typing import Optional
from datetime import date

from app.modules.environmental.models import (
    EmissionFactor,
    ProductESGProfile,
    EnvironmentalGoal,
    CarbonTransaction,
)
from app.modules.environmental.schemas import (
    EmissionFactorCreate,
    EmissionFactorUpdate,
    ProductESGProfileCreate,
    ProductESGProfileUpdate,
    EnvironmentalGoalCreate,
    EnvironmentalGoalUpdate,
    CarbonTransactionCreate,
    DashboardItem,
    DashboardResponse,
)
from app.modules.settings.models import SystemConfiguration
from app.modules.auth.models import Department


# ── Emission Factors ──────────────────────────────────────────────

def list_factors(session: Session, status: Optional[str] = None) -> list[EmissionFactor]:
    query = select(EmissionFactor)
    if status:
        query = query.where(EmissionFactor.status == status)
    return session.exec(query).all()


def get_factor(session: Session, factor_id: int) -> Optional[EmissionFactor]:
    return session.get(EmissionFactor, factor_id)


def create_factor(session: Session, data: EmissionFactorCreate) -> EmissionFactor:
    factor = EmissionFactor(**data.model_dump())
    session.add(factor)
    session.commit()
    session.refresh(factor)
    return factor


def update_factor(session: Session, factor_id: int, data: EmissionFactorUpdate) -> Optional[EmissionFactor]:
    factor = session.get(EmissionFactor, factor_id)
    if not factor:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(factor, key, value)
    session.add(factor)
    session.commit()
    session.refresh(factor)
    return factor


def delete_factor(session: Session, factor_id: int) -> bool:
    factor = session.get(EmissionFactor, factor_id)
    if not factor:
        return False
    factor.status = "Inactive"
    session.add(factor)
    session.commit()
    return True


# ── Product ESG Profiles ─────────────────────────────────────────

def list_products(session: Session, status: Optional[str] = None) -> list[ProductESGProfile]:
    query = select(ProductESGProfile)
    if status:
        query = query.where(ProductESGProfile.status == status)
    return session.exec(query).all()


def get_product(session: Session, product_id: int) -> Optional[ProductESGProfile]:
    return session.get(ProductESGProfile, product_id)


def create_product(session: Session, data: ProductESGProfileCreate) -> ProductESGProfile:
    product = ProductESGProfile(**data.model_dump())
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def update_product(session: Session, product_id: int, data: ProductESGProfileUpdate) -> Optional[ProductESGProfile]:
    product = session.get(ProductESGProfile, product_id)
    if not product:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


def delete_product(session: Session, product_id: int) -> bool:
    product = session.get(ProductESGProfile, product_id)
    if not product:
        return False
    product.status = "Inactive"
    session.add(product)
    session.commit()
    return True


# ── Environmental Goals ──────────────────────────────────────────

def list_goals(session: Session, status: Optional[str] = None) -> list[EnvironmentalGoal]:
    query = select(EnvironmentalGoal)
    if status:
        query = query.where(EnvironmentalGoal.status == status)
    return session.exec(query).all()


def get_goal(session: Session, goal_id: int) -> Optional[EnvironmentalGoal]:
    return session.get(EnvironmentalGoal, goal_id)


def create_goal(session: Session, data: EnvironmentalGoalCreate) -> EnvironmentalGoal:
    goal = EnvironmentalGoal(**data.model_dump())
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal


def update_goal(session: Session, goal_id: int, data: EnvironmentalGoalUpdate) -> Optional[EnvironmentalGoal]:
    goal = session.get(EnvironmentalGoal, goal_id)
    if not goal:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(goal, key, value)
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal


def delete_goal(session: Session, goal_id: int) -> bool:
    goal = session.get(EnvironmentalGoal, goal_id)
    if not goal:
        return False
    goal.status = "Missed"
    session.add(goal)
    session.commit()
    return True


# ── Carbon Transactions ──────────────────────────────────────────

def _get_auto_calculation_setting(session: Session) -> bool:
    config = session.exec(select(SystemConfiguration)).first()
    if config:
        return config.auto_emission_calculation
    return True


def log_transaction(session: Session, data: CarbonTransactionCreate) -> CarbonTransaction:
    if _get_auto_calculation_setting(session):
        factor = session.get(EmissionFactor, data.emission_factor_id)
        if factor:
            data.calculated_emissions_kg = factor.factor_value * data.raw_value

    tx = CarbonTransaction(**data.model_dump())
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


# ── Dashboard ────────────────────────────────────────────────────

def get_dashboard_data(
    session: Session,
    department_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    group_by: str = "month",
) -> DashboardResponse:
    query = select(
        CarbonTransaction.department_id,
        func.sum(CarbonTransaction.calculated_emissions_kg),
        func.count(CarbonTransaction.id),
    )

    date_col = CarbonTransaction.transaction_date
    if group_by == "day":
        period_expr = func.strftime("%Y-%m-%d", date_col)
    elif group_by == "year":
        period_expr = func.strftime("%Y", date_col)
    else:
        period_expr = func.strftime("%Y-%m", date_col)

    query = query.add_columns(period_expr)
    query = query.group_by(CarbonTransaction.department_id, period_expr)

    if department_id:
        query = query.where(CarbonTransaction.department_id == department_id)
    if start_date:
        query = query.where(CarbonTransaction.transaction_date >= start_date)
    if end_date:
        query = query.where(CarbonTransaction.transaction_date <= end_date)

    rows = session.exec(query).all()

    items: list[DashboardItem] = []
    total = 0.0
    dept_cache: dict[int, str] = {}

    for row in rows:
        dept_id = row[0]
        emissions = float(row[1] or 0)
        count = row[2]
        period = row[3]
        total += emissions

        if dept_id not in dept_cache:
            dept = session.get(Department, dept_id)
            dept_cache[dept_id] = dept.name if dept else "Unknown"

        items.append(DashboardItem(
            department_id=dept_id,
            department_name=dept_cache[dept_id],
            period=period,
            total_emissions_kg=emissions,
            transaction_count=count,
        ))

    return DashboardResponse(items=items, total_emissions_kg=total)
