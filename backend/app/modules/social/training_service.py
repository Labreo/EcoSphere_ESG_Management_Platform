from typing import Optional, List
from datetime import date, datetime
from sqlmodel import Session, select, func
from fastapi import HTTPException, status

from app.modules.social.training_models import TrainingCourse, EmployeeTraining
from app.modules.auth.models import Employee


def list_courses(session: Session, status_filter: Optional[str] = None) -> List[TrainingCourse]:
    query = select(TrainingCourse)
    if status_filter:
        query = query.where(TrainingCourse.status == status_filter)
    return session.exec(query).all()


def get_course(session: Session, course_id: int) -> Optional[TrainingCourse]:
    return session.get(TrainingCourse, course_id)


def start_course(session: Session, course_id: int, employee_id: int) -> EmployeeTraining:
    course = get_course(session, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if course.status != "Active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course is not active")

    existing = session.exec(
        select(EmployeeTraining).where(
            EmployeeTraining.employee_id == employee_id,
            EmployeeTraining.course_id == course_id,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already started this course")

    training = EmployeeTraining(
        employee_id=employee_id,
        course_id=course_id,
        progress=0.0,
        started_at=datetime.utcnow(),
    )
    session.add(training)
    session.commit()
    session.refresh(training)
    return training


def complete_course(session: Session, course_id: int, employee_id: int) -> EmployeeTraining:
    course = get_course(session, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    training = session.exec(
        select(EmployeeTraining).where(
            EmployeeTraining.employee_id == employee_id,
            EmployeeTraining.course_id == course_id,
        )
    ).first()
    if not training:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Training record not found")
    if training.completed_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course already completed")

    training.progress = 100.0
    training.completed_at = date.today()
    training.xp_awarded = course.xp

    employee = session.get(Employee, employee_id)
    if employee:
        employee.xp_points = (employee.xp_points or 0) + course.xp
        employee.redeemable_points = (employee.redeemable_points or 0) + course.xp
        session.add(employee)

    session.add(training)
    session.commit()
    session.refresh(training)
    return training


def get_employee_trainings(
    session: Session, employee_id: int
) -> List[dict]:
    records = session.exec(
        select(EmployeeTraining, TrainingCourse)
        .join(TrainingCourse, EmployeeTraining.course_id == TrainingCourse.id)
        .where(EmployeeTraining.employee_id == employee_id)
    ).all()
    result = []
    for et, tc in records:
        result.append({
            "id": et.id,
            "employee_id": et.employee_id,
            "course_id": et.course_id,
            "course_title": tc.title,
            "course_category": tc.category,
            "progress": et.progress,
            "started_at": et.started_at.isoformat() if et.started_at else None,
            "completed_at": et.completed_at.isoformat() if et.completed_at else None,
            "xp_awarded": et.xp_awarded,
        })
    return result


def get_training_stats(session: Session) -> dict:
    total_courses = session.exec(select(func.count(TrainingCourse.id))).one()
    active_courses = session.exec(
        select(func.count(TrainingCourse.id)).where(TrainingCourse.status == "Active")
    ).one()
    total_enrollments = session.exec(select(func.count(EmployeeTraining.id))).one()
    completed_enrollments = session.exec(
        select(func.count(EmployeeTraining.id)).where(EmployeeTraining.completed_at.isnot(None))
    ).one()
    return {
        "total_courses": total_courses,
        "active_courses": active_courses,
        "total_enrollments": total_enrollments,
        "completed_enrollments": completed_enrollments,
    }
