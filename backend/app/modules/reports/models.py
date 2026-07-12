from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class ReportFilter(BaseModel):
    department_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    module: Optional[str] = None  # "environmental", "social", "governance"
    employee_id: Optional[int] = None
    challenge_id: Optional[int] = None
    category_id: Optional[int] = None
