from pydantic import BaseModel
from typing import Optional
from datetime import date
from enum import Enum


class EmissionFactorCreate(BaseModel):
    activity_type: str
    factor_value: float
    unit: str
    status: str = "Active"


class EmissionFactorUpdate(BaseModel):
    activity_type: Optional[str] = None
    factor_value: Optional[float] = None
    unit: Optional[str] = None
    status: Optional[str] = None


class EmissionFactorRead(BaseModel):
    id: int
    activity_type: str
    factor_value: float
    unit: str
    status: str


class ProductESGProfileCreate(BaseModel):
    product_name: str
    product_sku: str
    carbon_footprint_kg: float = 0.0
    recyclability_percentage: float = 0.0
    water_footprint_liters: float = 0.0
    status: str = "Active"


class ProductESGProfileUpdate(BaseModel):
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    carbon_footprint_kg: Optional[float] = None
    recyclability_percentage: Optional[float] = None
    water_footprint_liters: Optional[float] = None
    status: Optional[str] = None


class ProductESGProfileRead(BaseModel):
    id: int
    product_name: str
    product_sku: str
    carbon_footprint_kg: float
    recyclability_percentage: float
    water_footprint_liters: float
    status: str


class EnvironmentalGoalCreate(BaseModel):
    title: str
    target_emission_reduction: float
    target_date: date
    current_progress: float = 0.0
    status: str = "Active"


class EnvironmentalGoalUpdate(BaseModel):
    title: Optional[str] = None
    target_emission_reduction: Optional[float] = None
    target_date: Optional[date] = None
    current_progress: Optional[float] = None
    status: Optional[str] = None


class EnvironmentalGoalRead(BaseModel):
    id: int
    title: str
    target_emission_reduction: float
    target_date: date
    current_progress: float
    status: str


class CarbonTransactionCreate(BaseModel):
    source_type: str
    source_id: str
    raw_value: float
    emission_factor_id: int
    calculated_emissions_kg: float = 0.0
    transaction_date: date = date.today()
    department_id: int


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
