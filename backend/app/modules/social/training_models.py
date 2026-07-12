from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date, datetime

class TrainingCourse(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    description: str = Field(default="")
    category: str = Field(default="Required")  # Required, Elective
    xp: int = Field(default=100)
    status: str = Field(default="Active")  # Active, Inactive

class EmployeeTraining(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id", index=True)
    course_id: int = Field(foreign_key="trainingcourse.id", index=True)
    progress: float = Field(default=0.0)
    started_at: Optional[datetime] = None
    completed_at: Optional[date] = None
    xp_awarded: int = Field(default=0)
