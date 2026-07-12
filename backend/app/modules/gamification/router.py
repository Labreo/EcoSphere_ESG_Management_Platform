from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from typing import Optional

from app.database import get_session
from app.modules.auth.models import Employee
from app.modules.auth.service import require_admin
from app.modules.gamification.schemas import (
    ChallengeCreate, ChallengeUpdate, ChallengeStatusUpdate,
    ParticipateRequest, EvidenceSubmit, ApproveRequest,
    RewardRedeemRequest,
)
from app.modules.gamification import service

router = APIRouter(prefix="/gamification", tags=["Gamification Module"])


# ── Challenges ──────────────────────────────────────────────────

@router.get("/challenges")
def list_challenges(
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    challenges = service.list_challenges(session, status)
    return challenges


@router.get("/challenges/{challenge_id}")
def get_challenge(challenge_id: int, session: Session = Depends(get_session)):
    return service.get_challenge(session, challenge_id)


@router.post("/challenges")
def create_challenge(data: ChallengeCreate, session: Session = Depends(get_session)):
    return service.create_challenge(session, data)


@router.put("/challenges/{challenge_id}")
def update_challenge(
    challenge_id: int,
    data: ChallengeUpdate,
    session: Session = Depends(get_session),
):
    return service.update_challenge(session, challenge_id, data)


@router.delete("/challenges/{challenge_id}")
def delete_challenge(challenge_id: int, session: Session = Depends(get_session)):
    service.delete_challenge(session, challenge_id)
    return {"message": "Challenge deleted"}


@router.patch("/challenges/{challenge_id}/status")
def update_challenge_status(
    challenge_id: int,
    data: ChallengeStatusUpdate,
    session: Session = Depends(get_session),
):
    return service.update_challenge_status(session, challenge_id, data.status)


# ── Participation ───────────────────────────────────────────────

@router.post("/challenges/{challenge_id}/participate")
def participate_in_challenge(
    challenge_id: int,
    data: ParticipateRequest,
    session: Session = Depends(get_session),
):
    return service.participate(session, challenge_id, data.employee_id)


@router.post("/challenges/{challenge_id}/submit-evidence")
def submit_challenge_evidence(
    challenge_id: int,
    data: EvidenceSubmit,
    session: Session = Depends(get_session),
):
    return service.submit_evidence(session, challenge_id, data)


@router.post("/challenges/participations/{participation_id}/approve")
def approve_challenge_participation(
    participation_id: int,
    session: Session = Depends(get_session),
    admin: Employee = Depends(require_admin),
):
    return service.approve_participation(session, participation_id, admin.id)


# ── Badges ──────────────────────────────────────────────────────

@router.get("/badges")
def list_badges(session: Session = Depends(get_session)):
    return service.list_badges(session)


# ── Rewards ─────────────────────────────────────────────────────

@router.get("/rewards")
def list_rewards(
    status: Optional[str] = Query(None),
    session: Session = Depends(get_session),
):
    return service.list_rewards(session, status)


@router.post("/rewards/{reward_id}/redeem")
def redeem_reward(
    reward_id: int,
    data: RewardRedeemRequest,
    session: Session = Depends(get_session),
):
    return service.redeem_reward(session, reward_id, data.employee_id)


# ── Leaderboard ─────────────────────────────────────────────────

@router.get("/leaderboard")
def get_leaderboard(
    type: str = Query("individual"),
    limit: int = Query(default=50, le=100),
    session: Session = Depends(get_session),
):
    if type == "department":
        return service.get_department_leaderboard(session)
    return service.get_individual_leaderboard(session, limit)
