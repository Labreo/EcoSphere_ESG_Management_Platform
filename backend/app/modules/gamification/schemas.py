from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import date, datetime


class ChallengeCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    category_id: int = Field(gt=0)
    description: str = Field(min_length=1, max_length=2000)
    xp: int = Field(default=100, ge=0, le=10000)
    difficulty: Literal["Easy", "Medium", "Hard"] = "Medium"
    evidence_required: bool = True
    deadline: datetime
    status: Literal["Draft", "Active", "Under Review", "Completed", "Archived"] = "Draft"

    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, v: datetime) -> datetime:
        if v < datetime.now():
            raise ValueError("deadline must be in the future")
        return v


class ChallengeUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    category_id: Optional[int] = Field(default=None, gt=0)
    description: Optional[str] = Field(default=None, min_length=1, max_length=2000)
    xp: Optional[int] = Field(default=None, ge=0, le=10000)
    difficulty: Optional[Literal["Easy", "Medium", "Hard"]] = None
    evidence_required: Optional[bool] = None
    deadline: Optional[datetime] = None


class ChallengeStatusUpdate(BaseModel):
    status: Literal["Active", "Under Review", "Completed", "Archived"]


class ParticipateRequest(BaseModel):
    employee_id: int = Field(gt=0)


class EvidenceSubmit(BaseModel):
    employee_id: int = Field(gt=0)
    proof_file_url: Optional[str] = None
    progress: float = Field(default=0.0, ge=0, le=100)

    @field_validator("proof_file_url")
    @classmethod
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.startswith(("http://", "https://")):
            raise ValueError("proof_file_url must be a valid HTTP/HTTPS URL")
        return v


class ApproveRequest(BaseModel):
    employee_id: int = Field(gt=0)


class RewardRedeemRequest(BaseModel):
    employee_id: int = Field(gt=0)


class LeaderboardEntry(BaseModel):
    employee_id: int
    employee_name: str
    department_name: Optional[str] = None
    xp_points: int


class DepartmentLeaderboardEntry(BaseModel):
    department_id: int
    department_name: str
    total_score: float
