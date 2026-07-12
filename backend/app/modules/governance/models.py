from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel


# ──────────────────────────────────────────────
#  Database Table Models
# ──────────────────────────────────────────────

class ESGPolicy(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: str
    version: str
    effective_date: date
    status: str = Field(default="Draft")  # Draft, Active, Retired


class PolicyAcknowledgement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id", index=True)
    policy_id: int = Field(foreign_key="esgpolicy.id", index=True)
    acknowledged_at: datetime = Field(default_factory=datetime.utcnow)


class Audit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    auditor: str
    audit_date: date
    score: float = Field(default=100.0)
    status: str = Field(default="Scheduled")  # Scheduled, In Progress, Completed


class ComplianceIssue(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    audit_id: Optional[int] = Field(default=None, foreign_key="audit.id")
    title: str
    description: str
    severity: str = Field(default="Medium")  # Low, Medium, High, Critical
    owner_id: int = Field(foreign_key="employee.id", index=True)
    due_date: date
    status: str = Field(default="Open")  # Open, Resolved, Overdue


# ──────────────────────────────────────────────
#  Request / Response Schemas (Pydantic)
# ──────────────────────────────────────────────

class ESGPolicyCreate(BaseModel):
    title: str
    description: str
    version: str
    effective_date: date
    status: str = "Draft"


class ESGPolicyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    effective_date: Optional[date] = None
    status: Optional[str] = None


class PolicyAcknowledgementCreate(BaseModel):
    employee_id: int
    policy_id: int


class AuditCreate(BaseModel):
    title: str
    auditor: str
    audit_date: date
    score: float = 100.0
    status: str = "Scheduled"


class AuditUpdate(BaseModel):
    title: Optional[str] = None
    auditor: Optional[str] = None
    audit_date: Optional[date] = None
    score: Optional[float] = None
    status: Optional[str] = None


class ComplianceIssueCreate(BaseModel):
    audit_id: Optional[int] = None
    title: str
    description: str
    severity: str = "Medium"
    owner_id: int
    due_date: date
    status: str = "Open"


class ComplianceIssueUpdate(BaseModel):
    audit_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    owner_id: Optional[int] = None
    due_date: Optional[date] = None
    status: Optional[str] = None


class NotificationRead(BaseModel):
    id: int
    employee_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime
