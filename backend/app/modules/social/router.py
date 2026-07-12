from typing import Optional, Literal
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from sqlmodel import Session
from app.database import get_session
from app.modules.auth.models import Employee
from app.modules.auth.service import get_current_user, require_admin, get_optional_user
from app.modules.social.models import CSRActivity, EmployeeParticipation
from app.modules.social.service import (
    list_activities,
    get_activity,
    create_activity,
    update_activity,
    delete_activity,
    join_activity,
    submit_proof,
    approve_participation,
    get_diversity_metrics,
)

router = APIRouter(prefix="/social", tags=["Social Module"])


class CSRActivityCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=2000)
    category_id: int = Field(gt=0)
    date: date
    points_reward: int = Field(default=100, ge=0, le=10000)
    max_participants: int = Field(default=50, ge=1, le=10000)
    status: Literal["Upcoming", "Active", "Completed", "Cancelled"] = "Upcoming"


class CSRActivityUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, min_length=1, max_length=2000)
    category_id: Optional[int] = Field(default=None, gt=0)
    date: Optional[date] = None
    points_reward: Optional[int] = Field(default=None, ge=0, le=10000)
    max_participants: Optional[int] = Field(default=None, ge=1, le=10000)
    status: Optional[Literal["Upcoming", "Active", "Completed", "Cancelled"]] = None


class CSRActivityResponse(BaseModel):
    id: int
    title: str
    description: str
    category_id: int
    date: date
    points_reward: int
    max_participants: int
    status: str

    model_config = {"from_attributes": True}


class EmployeeParticipationResponse(BaseModel):
    id: int
    employee_id: int
    activity_id: int
    proof_file_url: Optional[str] = None
    approval_status: str
    points_earned: int
    completion_date: Optional[date] = None

    model_config = {"from_attributes": True}


class SubmitProofRequest(BaseModel):
    proof_file_url: str = Field(min_length=1)

    @field_validator("proof_file_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("proof_file_url must be a valid HTTP/HTTPS URL")
        return v


# --- Endpoints ---

@router.get("/activities", response_model=list[CSRActivityResponse])
def list_activities_endpoint(
    status_filter: Optional[str] = None,
    category_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    session: Session = Depends(get_session),
):
    return list_activities(session, status_filter, category_id, date_from, date_to)


@router.get("/activities/{id}", response_model=CSRActivityResponse)
def get_activity_endpoint(id: int, session: Session = Depends(get_session)):
    activity = get_activity(session, id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


@router.post("/activities", response_model=CSRActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity_endpoint(
    data: CSRActivityCreate,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    return create_activity(session, data.model_dump())


@router.put("/activities/{id}", response_model=CSRActivityResponse)
def update_activity_endpoint(
    id: int,
    data: CSRActivityUpdate,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    activity = get_activity(session, id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    return update_activity(session, activity, update_data)


@router.delete("/activities/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity_endpoint(
    id: int,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    activity = get_activity(session, id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    delete_activity(session, activity)


@router.post("/activities/{id}/join", response_model=EmployeeParticipationResponse, status_code=status.HTTP_201_CREATED)
def join_activity_endpoint(
    id: int,
    session: Session = Depends(get_session),
    current_user: Employee = Depends(get_current_user),
):
    return join_activity(session, current_user.id, id)


@router.post("/activities/{id}/submit-proof", response_model=EmployeeParticipationResponse)
def submit_activity_proof_endpoint(
    id: int,
    data: SubmitProofRequest,
    session: Session = Depends(get_session),
    current_user: Employee = Depends(get_current_user),
):
    return submit_proof(session, current_user.id, id, data.proof_file_url)


@router.post("/participations/{id}/approve", response_model=EmployeeParticipationResponse)
def approve_participation_endpoint(
    id: int,
    session: Session = Depends(get_session),
    current_user: Employee = Depends(require_admin),
):
    return approve_participation(session, id, current_user.id)


@router.get("/diversity-metrics")
def get_diversity_metrics_endpoint(session: Session = Depends(get_session)):
    return get_diversity_metrics(session)
