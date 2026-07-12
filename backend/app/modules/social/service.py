from typing import Optional
from datetime import date
from sqlmodel import Session, select, func
from fastapi import HTTPException, status
from app.modules.social.models import CSRActivity, EmployeeParticipation
from app.modules.auth.models import Employee, Department
from app.modules.settings.models import SystemConfiguration


def list_activities(
    session: Session,
    status_filter: Optional[str] = None,
    category_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
) -> list[CSRActivity]:
    query = select(CSRActivity)
    if status_filter:
        query = query.where(CSRActivity.status == status_filter)
    if category_id is not None:
        query = query.where(CSRActivity.category_id == category_id)
    if date_from:
        query = query.where(CSRActivity.date >= date_from)
    if date_to:
        query = query.where(CSRActivity.date <= date_to)
    return session.exec(query).all()


def get_activity(session: Session, activity_id: int) -> Optional[CSRActivity]:
    return session.get(CSRActivity, activity_id)


def create_activity(session: Session, data: dict) -> CSRActivity:
    activity = CSRActivity(**data)
    session.add(activity)
    session.commit()
    session.refresh(activity)
    return activity


def update_activity(session: Session, activity: CSRActivity, data: dict) -> CSRActivity:
    for key, value in data.items():
        setattr(activity, key, value)
    session.add(activity)
    session.commit()
    session.refresh(activity)
    return activity


def delete_activity(session: Session, activity: CSRActivity) -> None:
    activity.status = "Cancelled"
    session.add(activity)
    session.commit()


def join_activity(session: Session, employee_id: int, activity_id: int) -> EmployeeParticipation:
    activity = session.get(CSRActivity, activity_id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    if activity.status != "Upcoming":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Activity is not open for joining")

    existing = session.exec(
        select(EmployeeParticipation).where(
            EmployeeParticipation.employee_id == employee_id,
            EmployeeParticipation.activity_id == activity_id,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already joined this activity")

    current_count = session.exec(
        select(func.count(EmployeeParticipation.id)).where(
            EmployeeParticipation.activity_id == activity_id
        )
    ).one()
    if activity.max_participants and current_count >= activity.max_participants:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Activity has reached maximum participants")

    participation = EmployeeParticipation(
        employee_id=employee_id,
        activity_id=activity_id,
    )
    session.add(participation)
    session.commit()
    session.refresh(participation)
    return participation


def submit_proof(session: Session, employee_id: int, activity_id: int, proof_url: str) -> EmployeeParticipation:
    activity = session.get(CSRActivity, activity_id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")

    participation = session.exec(
        select(EmployeeParticipation).where(
            EmployeeParticipation.employee_id == employee_id,
            EmployeeParticipation.activity_id == activity_id,
        )
    ).first()
    if not participation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participation not found")

    participation.proof_file_url = proof_url
    session.add(participation)
    session.commit()
    session.refresh(participation)
    return participation


def approve_participation(session: Session, participation_id: int, approver_id: int) -> EmployeeParticipation:
    participation = session.get(EmployeeParticipation, participation_id)
    if not participation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participation not found")

    config = session.get(SystemConfiguration, 1)
    if config and config.evidence_requirement and not participation.proof_file_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Evidence required: proof_file_url must be provided before approval",
        )

    if participation.approval_status == "Approved":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Participation already approved")

    activity = session.get(CSRActivity, participation.activity_id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated activity not found")

    participation.approval_status = "Approved"
    participation.points_earned = activity.points_reward
    participation.completion_date = date.today()

    employee = session.get(Employee, participation.employee_id)
    if employee:
        employee.xp_points = (employee.xp_points or 0) + activity.points_reward
        employee.redeemable_points = (employee.redeemable_points or 0) + activity.points_reward
        session.add(employee)

    session.add(participation)
    session.commit()
    session.refresh(participation)
    return participation


def get_diversity_metrics(session: Session) -> dict:
    total_employees = session.exec(
        select(func.count(Employee.id))
    ).one()

    gender_counts = session.exec(
        select(Employee.gender, func.count(Employee.id))
        .where(Employee.gender.isnot(None))
        .group_by(Employee.gender)
    ).all()
    gender_ratio = {g or "Unspecified": c for g, c in gender_counts}

    dept_data = session.exec(
        select(Department.name, func.count(Employee.id))
        .join(Employee, Employee.department_id == Department.id, isouter=True)
        .group_by(Department.id)
    ).all()
    department_dispersion = {name: count for name, count in dept_data}

    return {
        "total_employees": total_employees,
        "gender_ratio": gender_ratio,
        "department_dispersion": department_dispersion,
    }
