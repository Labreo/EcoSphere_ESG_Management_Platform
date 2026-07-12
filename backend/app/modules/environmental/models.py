from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date

class EmissionFactor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    activity_type: str = Field(index=True)  # e.g., "Electricity", "Travel", "Shipping"
    factor_value: float  # kg CO2 per unit
    unit: str  # e.g., "kWh", "km", "kg"
    status: str = Field(default="Active")  # Active, Inactive

class ProductESGProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product_name: str = Field(index=True)
    product_sku: str = Field(unique=True, index=True)
    carbon_footprint_kg: float = Field(default=0.0)
    recyclability_percentage: float = Field(default=0.0)
    water_footprint_liters: float = Field(default=0.0)
    status: str = Field(default="Active")  # Active, Inactive

class EnvironmentalGoal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    target_emission_reduction: float  # target carbon to reduce/limit to (kg CO2)
    target_date: date
    current_progress: float = Field(default=0.0)
    status: str = Field(default="Active")  # Active, Met, Missed

class CarbonTransaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    source_type: str = Field(index=True)  # Purchase, Manufacturing, Expense, Fleet
    source_id: str = Field(index=True)  # External/Odoo Transaction ID
    raw_value: float  # e.g., amount of km or kWh
    emission_factor_id: int = Field(foreign_key="emissionfactor.id")
    calculated_emissions_kg: float = Field(default=0.0)
    transaction_date: date = Field(default_factory=date.today)
    department_id: int = Field(foreign_key="department.id", index=True)
