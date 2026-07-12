from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.database import get_session

router = APIRouter(prefix="/gamification", tags=["Gamification Module"])

@router.get("/challenges")
def list_challenges(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent E
    return {"message": "List challenges skeleton"}

@router.post("/challenges")
def create_challenge(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent E
    return {"message": "Create challenge skeleton"}

@router.post("/challenges/{id}/participate")
def participate_in_challenge(id: int, session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent E
    return {"message": f"Participate in challenge {id} skeleton"}

@router.post("/challenges/{id}/submit-evidence")
def submit_challenge_evidence(id: int, session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent E
    return {"message": f"Submit evidence for challenge {id} skeleton"}

@router.post("/challenges/participations/{id}/approve")
def approve_challenge_participation(id: int, session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent E (Includes Badge Auto-Award logic check)
    return {"message": f"Approve challenge participation {id} skeleton"}

@router.get("/badges")
def list_badges(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent E
    return {"message": "List badges skeleton"}

@router.get("/rewards")
def list_rewards(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent E
    return {"message": "List rewards catalog skeleton"}

@router.post("/rewards/{id}/redeem")
def redeem_reward(id: int, session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent E (Includes Reward Redemption logic check)
    return {"message": f"Redeem reward {id} skeleton"}

@router.get("/leaderboard")
def get_leaderboard(session: Session = Depends(get_session)):
    # SKELETON: To be implemented by Agent E (Includes individual & department ranks)
    return {"message": "Get leaderboards skeleton"}
