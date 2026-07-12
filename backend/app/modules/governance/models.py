from sqlmodel import SQLModel, Field as SQLField
from typing import Optional, Literal
from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator


# ──────────────────────────────────────────────
#  Database Table Models
# ──────────────────────────────────────────────

class ESGPolicy(SQLModel, table=True):
    id: Optional[int] = SQLField(default=None, primary_key=True)
    title: str = SQLField(index=True)
    description: str
    version: str
    effective_date: date
    status: str = SQLField(default="Draft")


class PolicyAcknowledgement(SQLModel, table=True):
    id: Optional[int] = SQLField(default=None, primary_key=True)
    employee_id: int = SQLField(foreign_key="employee.id", index=True)
    policy_id: int = SQLField(foreign_key="esgpolicy.id", index=True)
    acknowledged_at: datetime = SQLField(default_factory=datetime.utcnow)


class Audit(SQLModel, table=True):
    id: Optional[int] = SQLField(default=None, primary_key=True)
    title: str
    auditor: str
    audit_date: date
    score: float = SQLField(default=100.0)
    status: str = SQLField(default="Scheduled")


class ComplianceIssue(SQLModel, table=True):
    id: Optional[int] = SQLField(default=None, primary_key=True)
    audit_id: Optional[int] = SQLField(default=None, foreign_key="audit.id")
    title: str
    description: str
    severity: str = SQLField(default="Medium")
    owner_id: int = SQLField(foreign_key="employee.id", index=True)
    due_date: date
    status: str = SQLField(default="Open")


# ──────────────────────────────────────────────
#  Request / Response Schemas (Pydantic)
# ──────────────────────────────────────────────

class ESGPolicyCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    version: str = Field(min_length=1, max_length=20)
    effective_date: date
    status: Literal["Draft", "Active", "Retired"] = "Draft"


class ESGPolicyUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, min_length=1, max_length=5000)
    version: Optional[str] = Field(default=None, min_length=1, max_length=20)
    effective_date: Optional[date] = None
    status: Optional[Literal["Draft", "Active", "Retired"]] = None


class PolicyAcknowledgementCreate(BaseModel):
    employee_id: int = Field(gt=0)
    policy_id: int = Field(gt=0)


class AuditCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    auditor: str = Field(min_length=1, max_length=100)
    audit_date: date
    score: float = Field(default=100.0, ge=0, le=100)
    status: Literal["Scheduled", "In Progress", "Completed"] = "Scheduled"


class AuditUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    auditor: Optional[str] = Field(default=None, min_length=1, max_length=100)
    audit_date: Optional[date] = None
    score: Optional[float] = Field(default=None, ge=0, le=100)
    status: Optional[Literal["Scheduled", "In Progress", "Completed"]] = None


class ComplianceIssueCreate(BaseModel):
    audit_id: Optional[int] = Field(default=None, gt=0)
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    severity: Literal["Low", "Medium", "High", "Critical"] = "Medium"
    owner_id: int = Field(gt=0)
    due_date: date
    status: Literal["Open", "Resolved", "Overdue"] = "Open"

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("due_date must be today or in the future")
        return v


class ComplianceIssueUpdate(BaseModel):
    audit_id: Optional[int] = Field(default=None, gt=0)
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, min_length=1, max_length=5000)
    severity: Optional[Literal["Low", "Medium", "High", "Critical"]] = None
    owner_id: Optional[int] = Field(default=None, gt=0)
    due_date: Optional[date] = None
    status: Optional[Literal["Open", "Resolved", "Overdue"]] = None


class NotificationRead(BaseModel):
    id: int
    employee_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime
