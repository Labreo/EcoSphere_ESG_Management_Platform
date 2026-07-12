from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date

class CSRActivity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: str
    category_id: int = Field(foreign_key="category.id")
    date: date
    points_reward: int = Field(default=100)
    max_participants: int = Field(default=50)
    status: str = Field(default="Upcoming")  # Upcoming, Completed, Cancelled

class EmployeeParticipation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id", index=True)
    activity_id: int = Field(foreign_key="csractivity.id", index=True)
    proof_file_url: Optional[str] = None
    approval_status: str = Field(default="Pending")  # Pending, Approved, Rejected
    points_earned: int = Field(default=0)
    completion_date: Optional[date] = None
