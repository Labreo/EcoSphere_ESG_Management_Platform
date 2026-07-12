import json
from typing import Optional, List
from sqlmodel import Session, select, func
from fastapi import HTTPException, status

from app.modules.gamification.models import (
    Badge, Reward, Challenge, ChallengeParticipation,
    BadgeUnlock, RewardRedemption,
)
from app.modules.gamification.schemas import (
    ChallengeCreate, ChallengeUpdate,
    EvidenceSubmit,
)
from app.modules.auth.models import Employee
from app.modules.settings.models import SystemConfiguration, DepartmentScore


VALID_STATUS_TRANSITIONS = {
    "Draft": ["Active"],
    "Active": ["Under Review"],
    "Under Review": ["Completed", "Archived"],
    "Completed": [],
    "Archived": [],
}


# ── Challenge CRUD ──────────────────────────────────────────────

def create_challenge(session: Session, data: ChallengeCreate) -> Challenge:
    challenge = Challenge(**data.model_dump())
    session.add(challenge)
    session.commit()
    session.refresh(challenge)
    return challenge


def list_challenges(session: Session, status_filter: Optional[str] = None) -> List[Challenge]:
    query = select(Challenge)
    if status_filter:
        query = query.where(Challenge.status == status_filter)
    return session.exec(query).all()


def get_challenge(session: Session, challenge_id: int) -> Challenge:
    challenge = session.get(Challenge, challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge


def update_challenge(session: Session, challenge_id: int, data: ChallengeUpdate) -> Challenge:
    challenge = get_challenge(session, challenge_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(challenge, field, value)
    session.add(challenge)
    session.commit()
    session.refresh(challenge)
    return challenge


def delete_challenge(session: Session, challenge_id: int):
    challenge = get_challenge(session, challenge_id)
    session.delete(challenge)
    session.commit()


def update_challenge_status(session: Session, challenge_id: int, new_status: str) -> Challenge:
    challenge = get_challenge(session, challenge_id)
    allowed = VALID_STATUS_TRANSITIONS.get(challenge.status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{challenge.status}' to '{new_status}'. "
                   f"Allowed: {allowed}"
        )
    challenge.status = new_status
    session.add(challenge)
    session.commit()
    session.refresh(challenge)
    return challenge


# ── Participation ───────────────────────────────────────────────

def participate(session: Session, challenge_id: int, employee_id: int) -> ChallengeParticipation:
    challenge = get_challenge(session, challenge_id)
    if challenge.status != "Active":
        raise HTTPException(status_code=400, detail="Challenge is not active")

    existing = session.exec(
        select(ChallengeParticipation).where(
            ChallengeParticipation.challenge_id == challenge_id,
            ChallengeParticipation.employee_id == employee_id,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already participating in this challenge")

    participation = ChallengeParticipation(
        challenge_id=challenge_id,
        employee_id=employee_id,
    )
    session.add(participation)
    session.commit()
    session.refresh(participation)
    return participation


def submit_evidence(session: Session, challenge_id: int, data: EvidenceSubmit) -> ChallengeParticipation:
    participation = session.exec(
        select(ChallengeParticipation).where(
            ChallengeParticipation.challenge_id == challenge_id,
            ChallengeParticipation.employee_id == data.employee_id,
        )
    ).first()
    if not participation:
        raise HTTPException(status_code=404, detail="Participation not found")
    if participation.approval_status != "Pending":
        raise HTTPException(status_code=400, detail="Participation already reviewed")

    participation.proof_file_url = data.proof_file_url
    participation.progress = data.progress
    session.add(participation)
    session.commit()
    session.refresh(participation)
    return participation


def approve_participation(
    session: Session, participation_id: int, employee_id: int
) -> ChallengeParticipation:
    participation = session.get(ChallengeParticipation, participation_id)
    if not participation:
        raise HTTPException(status_code=404, detail="Participation not found")
    if participation.approval_status != "Pending":
        raise HTTPException(status_code=400, detail="Participation already reviewed")
    if participation.employee_id != employee_id:
        raise HTTPException(status_code=403, detail="Not authorized for this participation")

    challenge = get_challenge(session, participation.challenge_id)

    participation.approval_status = "Approved"
    participation.xp_awarded = challenge.xp
    participation.status = "Completed"
    participation.progress = 100.0

    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    employee.xp_points = (employee.xp_points or 0) + challenge.xp
    employee.redeemable_points = (employee.redeemable_points or 0) + challenge.xp

    session.add(participation)
    session.add(employee)
    session.commit()

    _check_and_award_badges(session, employee_id)

    session.refresh(participation)
    return participation


# ── Badges ──────────────────────────────────────────────────────

def list_badges(session: Session) -> List[Badge]:
    return session.exec(select(Badge)).all()


def _check_and_award_badges(session: Session, employee_id: int):
    config = session.get(SystemConfiguration, 1)
    if not config or not config.badge_auto_award:
        return

    badges = session.exec(select(Badge)).all()
    employee = session.get(Employee, employee_id)
    if not employee:
        return

    completed_count = session.exec(
        select(func.count(ChallengeParticipation.id)).where(
            ChallengeParticipation.employee_id == employee_id,
            ChallengeParticipation.approval_status == "Approved",
        )
    ).one()

    for badge in badges:
        try:
            rule = json.loads(badge.unlock_rule)
        except (json.JSONDecodeError, TypeError):
            continue

        metric = rule.get("metric")
        value = rule.get("value", 0)

        if metric == "xp":
            satisfied = (employee.xp_points or 0) >= value
        elif metric == "challenges":
            satisfied = completed_count >= value
        else:
            continue

        if not satisfied:
            continue

        existing = session.exec(
            select(BadgeUnlock).where(
                BadgeUnlock.employee_id == employee_id,
                BadgeUnlock.badge_id == badge.id,
            )
        ).first()
        if existing:
            continue

        unlock = BadgeUnlock(employee_id=employee_id, badge_id=badge.id)
        session.add(unlock)
        session.commit()


# ── Rewards ─────────────────────────────────────────────────────

def list_rewards(session: Session, status_filter: Optional[str] = None) -> List[Reward]:
    query = select(Reward)
    if status_filter:
        query = query.where(Reward.status == status_filter)
    return session.exec(query).all()


def redeem_reward(session: Session, reward_id: int, employee_id: int) -> RewardRedemption:
    reward = session.get(Reward, reward_id)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    if reward.status != "Active":
        raise HTTPException(status_code=400, detail="Reward is not active")
    if reward.stock <= 0:
        raise HTTPException(status_code=400, detail="Reward out of stock")

    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    if (employee.redeemable_points or 0) < reward.points_required:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient points. Required: {reward.points_required}, "
                   f"Available: {employee.redeemable_points}"
        )

    employee.redeemable_points -= reward.points_required
    reward.stock -= 1

    redemption = RewardRedemption(
        employee_id=employee_id,
        reward_id=reward_id,
    )
    session.add(redemption)
    session.add(employee)
    session.add(reward)
    session.commit()
    session.refresh(redemption)
    return redemption


# ── Leaderboard ─────────────────────────────────────────────────

def get_individual_leaderboard(session: Session, limit: int = 50) -> List[dict]:
    employees = session.exec(
        select(Employee).order_by(Employee.xp_points.desc()).limit(limit)
    ).all()
    result = []
    for emp in employees:
        dept_name = emp.department.name if emp.department else None
        result.append({
            "employee_id": emp.id,
            "employee_name": emp.name,
            "department_name": dept_name,
            "xp_points": emp.xp_points or 0,
        })
    return result


def get_department_leaderboard(session: Session) -> List[dict]:
    scores = session.exec(
        select(DepartmentScore).order_by(DepartmentScore.total_score.desc())
    ).all()

    result = []
    for score in scores:
        dept_name = score.department.name if hasattr(score, "department") and score.department else f"Department {score.department_id}"
        result.append({
            "department_id": score.department_id,
            "department_name": dept_name,
            "total_score": score.total_score,
        })
    return result
