from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ChallengeCreate(BaseModel):
    title: str
    category_id: int
    description: str
    xp: int = 100
    difficulty: str = "Medium"
    evidence_required: bool = True
    deadline: datetime
    status: str = "Draft"


class ChallengeUpdate(BaseModel):
    title: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    xp: Optional[int] = None
    difficulty: Optional[str] = None
    evidence_required: Optional[bool] = None
    deadline: Optional[datetime] = None


class ChallengeStatusUpdate(BaseModel):
    status: str


class ParticipateRequest(BaseModel):
    employee_id: int


class EvidenceSubmit(BaseModel):
    employee_id: int
    proof_file_url: Optional[str] = None
    progress: float = 0.0


class ApproveRequest(BaseModel):
    employee_id: int


class RewardRedeemRequest(BaseModel):
    employee_id: int


class LeaderboardEntry(BaseModel):
    employee_id: int
    employee_name: str
    department_name: Optional[str] = None
    xp_points: int


class DepartmentLeaderboardEntry(BaseModel):
    department_id: int
    department_name: str
    total_score: float
