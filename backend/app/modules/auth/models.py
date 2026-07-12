from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Department(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    code: str = Field(unique=True, index=True)
    head: Optional[str] = None
    parent_department_id: Optional[int] = Field(default=None, foreign_key="department.id")
    employee_count: int = Field(default=0)
    status: str = Field(default="Active")  # Active, Inactive
    
    # Relationships
    employees: List["Employee"] = Relationship(back_populates="department")

class Employee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    role: str = Field(default="Employee")  # Admin, ESG Manager, Employee
    department_id: Optional[int] = Field(default=None, foreign_key="department.id")
    xp_points: int = Field(default=0)
    redeemable_points: int = Field(default=0)
    
    # Relationships
    department: Optional[Department] = Relationship(back_populates="employees")
