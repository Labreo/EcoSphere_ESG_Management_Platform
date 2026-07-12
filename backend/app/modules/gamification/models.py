from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, datetime

class Badge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: str
    unlock_rule: str  # JSON-string mapping e.g., '{"metric": "xp", "value": 500}' or '{"metric": "challenges", "value": 5}'
    icon: str  # URL or asset path

class Reward(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str
    points_required: int
    stock: int = Field(default=0)
    status: str = Field(default="Active")  # Active, Inactive

class Challenge(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    category_id: int = Field(foreign_key="category.id")
    description: str
    xp: int = Field(default=100)
    difficulty: str = Field(default="Medium")  # Easy, Medium, Hard
    evidence_required: bool = Field(default=True)
    deadline: datetime
    status: str = Field(default="Draft")  # Draft, Active, Under Review, Completed, Archived

class ChallengeParticipation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    challenge_id: int = Field(foreign_key="challenge.id", index=True)
    employee_id: int = Field(foreign_key="employee.id", index=True)
    progress: float = Field(default=0.0)  # Percentage 0-100
    proof_file_url: Optional[str] = None
    approval_status: str = Field(default="Pending")  # Pending, Approved, Rejected
    xp_awarded: int = Field(default=0)
    status: str = Field(default="Joined")  # Joined, Completed

class BadgeUnlock(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id", index=True)
    badge_id: int = Field(foreign_key="badge.id", index=True)
    unlocked_at: datetime = Field(default_factory=datetime.utcnow)

class RewardRedemption(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id", index=True)
    reward_id: int = Field(foreign_key="reward.id", index=True)
    redeemed_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="Requested")  # Requested, Fulfilled, Cancelled
