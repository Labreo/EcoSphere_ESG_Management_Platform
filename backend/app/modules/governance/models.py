from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, datetime

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
    audit_id: Optional[int] = Field(default=None, foreign_key="audit.id", nullable=True)
    title: str
    description: str
    severity: str = Field(default="Medium")  # Low, Medium, High, Critical
    owner_id: int = Field(foreign_key="employee.id", index=True)
    due_date: date
    status: str = Field(default="Open")  # Open, Resolved, Overdue
