from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    type: str = Field(index=True)  # "CSR Activity" or "Challenge"
    status: str = Field(default="Active")  # "Active", "Inactive"

class DepartmentScore(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    department_id: int = Field(foreign_key="department.id", index=True)
    environmental_score: float = Field(default=0.0)
    social_score: float = Field(default=0.0)
    governance_score: float = Field(default=0.0)
    total_score: float = Field(default=0.0)
    calculation_date: date = Field(default_factory=date.today)

class SystemConfiguration(SQLModel, table=True):
    id: Optional[int] = Field(default=1, primary_key=True)
    auto_emission_calculation: bool = Field(default=True)
    evidence_requirement: bool = Field(default=True)
    badge_auto_award: bool = Field(default=True)
    
    # ESG weights
    environmental_weight: float = Field(default=0.40)
    social_weight: float = Field(default=0.30)
    governance_weight: float = Field(default=0.30)
