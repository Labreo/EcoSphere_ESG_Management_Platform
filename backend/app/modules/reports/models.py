from pydantic import BaseModel, model_validator
from typing import Optional, List, Literal
from datetime import date

class ReportFilter(BaseModel):
    department_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    module: Optional[Literal["environmental", "social", "governance"]] = None
    employee_id: Optional[int] = None
    challenge_id: Optional[int] = None
    category_id: Optional[int] = None

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self
