from sqlmodel import Session, select
from app.modules.settings.models import SystemConfiguration, Category, Notification
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Literal

class ConfigUpdate(BaseModel):
    auto_emission_calculation: Optional[bool] = None
    evidence_requirement: Optional[bool] = None
    badge_auto_award: Optional[bool] = None
    environmental_weight: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    social_weight: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    governance_weight: Optional[float] = Field(default=None, ge=0.0, le=1.0)

    @model_validator(mode="after")
    def validate_weights(self):
        weights = [self.environmental_weight, self.social_weight, self.governance_weight]
        if all(w is not None for w in weights):
            total = sum(weights)
            if abs(total - 1.0) > 0.01:
                raise ValueError(f"Weights must sum to 1.0, got {total}")
        return self

class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: Literal["CSR Activity", "Challenge"]
    status: Literal["Active", "Inactive"] = "Active"


def get_config(session: Session) -> SystemConfiguration:
    config = session.get(SystemConfiguration, 1)
    if config is None:
        config = SystemConfiguration()
        session.add(config)
        session.commit()
        session.refresh(config)
    return config

def update_config(session: Session, data: ConfigUpdate) -> SystemConfiguration:
    config = get_config(session)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    session.add(config)
    session.commit()
    session.refresh(config)
    return config

def list_categories(session: Session, type_filter: Optional[str] = None) -> list[Category]:
    query = select(Category)
    if type_filter:
        query = query.where(Category.type == type_filter)
    return session.exec(query).all()

def create_category(session: Session, data: CategoryCreate) -> Category:
    category = Category(name=data.name, type=data.type, status=data.status)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


# Notification Engine

def create_notification(session: Session, employee_id: int, title: str, message: str, notification_type: str = "system") -> Notification:
    notification = Notification(
        employee_id=employee_id,
        title=title,
        message=message,
        notification_type=notification_type,
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification

def get_user_notifications(session: Session, employee_id: int, unread_only: bool = False) -> list[Notification]:
    query = select(Notification).where(Notification.employee_id == employee_id)
    if unread_only:
        query = query.where(Notification.is_read == False)
    query = query.order_by(Notification.created_at.desc())
    return session.exec(query).all()

def mark_notification_read(session: Session, notification_id: int, employee_id: int) -> Optional[Notification]:
    notification = session.get(Notification, notification_id)
    if notification and notification.employee_id == employee_id:
        notification.is_read = True
        session.add(notification)
        session.commit()
        session.refresh(notification)
        return notification
    return None
