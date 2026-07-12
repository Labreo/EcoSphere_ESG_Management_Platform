from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import date
from enum import Enum


class EmissionFactorCreate(BaseModel):
    activity_type: str = Field(min_length=1, max_length=200)
    factor_value: float = Field(gt=0)
    unit: str = Field(min_length=1, max_length=50)
    status: Literal["Active", "Inactive"] = "Active"


class EmissionFactorUpdate(BaseModel):
    activity_type: Optional[str] = Field(default=None, min_length=1, max_length=200)
    factor_value: Optional[float] = Field(default=None, gt=0)
    unit: Optional[str] = Field(default=None, min_length=1, max_length=50)
    status: Optional[Literal["Active", "Inactive"]] = None


class EmissionFactorRead(BaseModel):
    id: int
    activity_type: str
    factor_value: float
    unit: str
    status: str


class ProductESGProfileCreate(BaseModel):
    product_name: str = Field(min_length=1, max_length=200)
    product_sku: str = Field(min_length=1, max_length=50)
    carbon_footprint_kg: float = Field(default=0.0, ge=0)
    recyclability_percentage: float = Field(default=0.0, ge=0, le=100)
    water_footprint_liters: float = Field(default=0.0, ge=0)
    status: Literal["Active", "Inactive"] = "Active"


class ProductESGProfileUpdate(BaseModel):
    product_name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    product_sku: Optional[str] = Field(default=None, min_length=1, max_length=50)
    carbon_footprint_kg: Optional[float] = Field(default=None, ge=0)
    recyclability_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    water_footprint_liters: Optional[float] = Field(default=None, ge=0)
    status: Optional[Literal["Active", "Inactive"]] = None


class ProductESGProfileRead(BaseModel):
    id: int
    product_name: str
    product_sku: str
    carbon_footprint_kg: float
    recyclability_percentage: float
    water_footprint_liters: float
    status: str


class EnvironmentalGoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    target_emission_reduction: float = Field(gt=0)
    target_date: date
    current_progress: float = Field(default=0.0, ge=0)
    status: Literal["Active", "On Track", "At Risk", "Completed"] = "Active"

    @field_validator("target_date")
    @classmethod
    def validate_future_date(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("target_date must be today or in the future")
        return v


class EnvironmentalGoalUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    target_emission_reduction: Optional[float] = Field(default=None, gt=0)
    target_date: Optional[date] = None
    current_progress: Optional[float] = Field(default=None, ge=0)
    status: Optional[Literal["Active", "On Track", "At Risk", "Completed"]] = None


class EnvironmentalGoalRead(BaseModel):
    id: int
    title: str
    target_emission_reduction: float
    target_date: date
    current_progress: float
    status: str


class CarbonTransactionCreate(BaseModel):
    source_type: str = Field(min_length=1, max_length=50)
    source_id: str = Field(min_length=1, max_length=100)
    raw_value: float = Field(gt=0)
    emission_factor_id: int = Field(gt=0)
    calculated_emissions_kg: float = Field(default=0.0, ge=0)
    transaction_date: date = date.today()
    department_id: int = Field(gt=0)

    @field_validator("transaction_date")
    @classmethod
    def validate_transaction_date(cls, v: date) -> date:
        max_date = date.today()
        if v > max_date:
            raise ValueError("transaction_date cannot be in the future")
        return v


class CarbonTransactionRead(BaseModel):
    id: int
    source_type: str
    source_id: str
    raw_value: float
    emission_factor_id: int
    calculated_emissions_kg: float
    transaction_date: date
    department_id: int


class GroupByEnum(str, Enum):
    day = "day"
    month = "month"
    year = "year"


class DashboardItem(BaseModel):
    department_id: int
    department_name: Optional[str] = None
    period: str
    total_emissions_kg: float
    transaction_count: int


class DashboardResponse(BaseModel):
    items: list[DashboardItem]
    total_emissions_kg: float
