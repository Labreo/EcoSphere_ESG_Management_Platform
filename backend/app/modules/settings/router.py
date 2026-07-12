from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from app.database import get_session
from app.modules.settings.service import (
    get_config, update_config, ConfigUpdate,
    list_categories, create_category, CategoryCreate,
    get_user_notifications, mark_notification_read, mark_all_notifications_read, create_notification
)
from typing import Optional

router = APIRouter(prefix="/settings", tags=["Settings & Administration"])
notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])


# -- System Configuration --

@router.get("/config")
def get_system_config(session: Session = Depends(get_session)):
    return get_config(session)

@router.patch("/config")
def patch_system_config(data: ConfigUpdate, session: Session = Depends(get_session)):
    return update_config(session, data)


# -- Category Master Data --

@router.get("/categories")
def list_categories_endpoint(
    type: Optional[str] = Query(None, description="Filter by type: CSR Activity or Challenge"),
    session: Session = Depends(get_session)
):
    return list_categories(session, type)

@router.post("/categories")
def create_category_endpoint(data: CategoryCreate, session: Session = Depends(get_session)):
    return create_category(session, data)


# -- Notifications --

@notifications_router.get("")
def get_notifications(
    employee_id: int = Query(..., description="User ID to fetch notifications for"),
    unread_only: bool = Query(False),
    session: Session = Depends(get_session)
):
    return get_user_notifications(session, employee_id, unread_only)

@notifications_router.patch("/{notification_id}/read")
def mark_as_read(notification_id: int, employee_id: int = Query(...), session: Session = Depends(get_session)):
    result = mark_notification_read(session, notification_id, employee_id)
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
    return result

@notifications_router.patch("/read-all")
def mark_all_read(employee_id: int = Query(...), session: Session = Depends(get_session)):
    count = mark_all_notifications_read(session, employee_id)
    return {"success": True, "marked_read": count}
