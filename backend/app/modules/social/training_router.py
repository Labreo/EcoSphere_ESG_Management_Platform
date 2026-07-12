from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session

from app.database import get_session
from app.modules.auth.models import Employee
from app.modules.auth.service import get_current_user, require_admin
from app.modules.social.training_models import TrainingCourse
from app.modules.social.training_service import (
    list_courses, get_course, start_course, complete_course,
    get_employee_trainings, get_training_stats,
)

router = APIRouter(prefix="/social/training", tags=["Social - Training"])


class TrainingCourseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""
    category: str = "Required"
    xp: int = 100
    status: str = "Active"


class TrainingCourseResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    xp: int
    status: str

    model_config = {"from_attributes": True}


class EmployeeTrainingResponse(BaseModel):
    id: int
    employee_id: int
    course_id: int
    course_title: str = ""
    course_category: str = ""
    progress: float
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    xp_awarded: int

    model_config = {"from_attributes": True}


@router.get("/courses", response_model=list[TrainingCourseResponse])
def list_training_courses(
    status_filter: Optional[str] = None,
    session: Session = Depends(get_session),
):
    return list_courses(session, status_filter)


@router.get("/courses/{id}", response_model=TrainingCourseResponse)
def get_training_course(id: int, session: Session = Depends(get_session)):
    course = get_course(session, id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


@router.post("/courses", response_model=TrainingCourseResponse, status_code=status.HTTP_201_CREATED)
def create_training_course(
    data: TrainingCourseCreate,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    course = TrainingCourse(**data.model_dump())
    session.add(course)
    session.commit()
    session.refresh(course)
    return course


@router.post("/courses/{id}/start", status_code=status.HTTP_201_CREATED)
def start_training_course(
    id: int,
    session: Session = Depends(get_session),
    current_user: Employee = Depends(get_current_user),
):
    result = start_course(session, id, current_user.id)
    return {
        "id": result.id,
        "employee_id": result.employee_id,
        "course_id": result.course_id,
        "progress": result.progress,
        "started_at": result.started_at.isoformat() if result.started_at else None,
        "completed_at": result.completed_at.isoformat() if result.completed_at else None,
        "xp_awarded": result.xp_awarded,
    }


@router.post("/courses/{id}/complete")
def complete_training_course(
    id: int,
    session: Session = Depends(get_session),
    current_user: Employee = Depends(get_current_user),
):
    result = complete_course(session, id, current_user.id)
    return {
        "id": result.id,
        "employee_id": result.employee_id,
        "course_id": result.course_id,
        "progress": result.progress,
        "started_at": result.started_at.isoformat() if result.started_at else None,
        "completed_at": result.completed_at.isoformat() if result.completed_at else None,
        "xp_awarded": result.xp_awarded,
    }


@router.get("/my-training")
def my_training(
    session: Session = Depends(get_session),
    current_user: Employee = Depends(get_current_user),
):
    return get_employee_trainings(session, current_user.id)


@router.get("/stats")
def training_stats(session: Session = Depends(get_session)):
    return get_training_stats(session)
