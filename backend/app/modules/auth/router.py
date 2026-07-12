from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import Session, select
from app.database import get_session
from app.modules.auth.models import Employee, Department
from app.modules.auth.service import (
    hash_password,
    authenticate_user,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    get_current_user,
    require_admin,
    get_departments,
    get_department,
    create_department,
    update_department,
    delete_department,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
dept_router = APIRouter(prefix="/departments", tags=["Departments"])

# --- Schemas ---

class EmployeeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Literal["Admin", "Manager", "Employee"] = "Employee"
    department_id: Optional[int] = Field(default=None, gt=0)

class EmployeeResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    gender: Optional[str] = None
    designation: Optional[str] = None
    bio: Optional[str] = None
    department_id: Optional[int] = None
    xp_points: int
    redeemable_points: int
    is_email_verified: bool = False

    model_config = {"from_attributes": True}

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    designation: Optional[str] = Field(default=None, max_length=100)
    gender: Optional[str] = Field(default=None)
    bio: Optional[str] = Field(default=None, max_length=250)

class DepartmentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    code: str = Field(min_length=1, max_length=20)
    head: Optional[str] = Field(default=None, max_length=100)
    parent_department_id: Optional[int] = Field(default=None, gt=0)
    employee_count: int = Field(default=0, ge=0)
    status: Literal["Active", "Inactive"] = "Active"

class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    code: Optional[str] = Field(default=None, min_length=1, max_length=20)
    head: Optional[str] = Field(default=None, max_length=100)
    parent_department_id: Optional[int] = Field(default=None, gt=0)
    employee_count: Optional[int] = Field(default=None, ge=0)
    status: Optional[Literal["Active", "Inactive"]] = None

class DepartmentResponse(BaseModel):
    id: int
    name: str
    code: str
    head: Optional[str] = None
    parent_department_id: Optional[int] = None
    employee_count: int
    status: str

    model_config = {"from_attributes": True}

# --- Auth Endpoints ---

@router.post("/register", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def register(data: EmployeeCreate, session: Session = Depends(get_session)):
    existing = session.exec(
        select(Employee).where(Employee.email == data.email)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    employee = Employee(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        department_id=data.department_id,
    )
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, session: Session = Depends(get_session)):
    employee = authenticate_user(session, data.email, data.password)
    if not employee:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    access_token = create_access_token(data={"sub": employee.email})
    refresh_token = create_refresh_token(data={"sub": employee.email})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: RefreshRequest, session: Session = Depends(get_session)):
    payload = verify_refresh_token(data.refresh_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
    email = payload.get("sub")
    employee = session.exec(select(Employee).where(Employee.email == email)).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    access_token = create_access_token(data={"sub": employee.email})
    refresh_token = create_refresh_token(data={"sub": employee.email})
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)

@router.get("/me", response_model=EmployeeResponse)
def get_me(current_user: Employee = Depends(get_current_user)):
    return current_user

@router.put("/me/profile")
def update_profile(
    data: ProfileUpdate,
    current_user: Employee = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    update_data = data.model_dump(exclude_unset=True, exclude_none=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

# --- Department Endpoints ---

@dept_router.get("/", response_model=list[DepartmentResponse])
def list_departments(session: Session = Depends(get_session)):
    return get_departments(session)

@dept_router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department_endpoint(
    data: DepartmentCreate,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    existing = session.exec(select(Department).where(Department.code == data.code)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Department code already exists")
    return create_department(session, data.model_dump())

@dept_router.get("/{department_id}", response_model=DepartmentResponse)
def get_department_endpoint(department_id: int, session: Session = Depends(get_session)):
    department = get_department(session, department_id)
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return department

@dept_router.put("/{department_id}", response_model=DepartmentResponse)
def update_department_endpoint(
    department_id: int,
    data: DepartmentUpdate,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    department = get_department(session, department_id)
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    return update_department(session, department, update_data)

@dept_router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department_endpoint(
    department_id: int,
    session: Session = Depends(get_session),
    _: Employee = Depends(require_admin),
):
    department = get_department(session, department_id)
    if not department:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    delete_department(session, department)
