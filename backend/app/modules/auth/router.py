from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session
from app.database import get_session
from app.modules.auth.models import Employee, Department
from app.modules.auth.service import (
    hash_password,
    authenticate_user,
    create_access_token,
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
    name: str
    email: str
    password: str
    role: str = "Employee"
    department_id: Optional[int] = None

class EmployeeResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department_id: Optional[int] = None
    xp_points: int
    redeemable_points: int

    model_config = {"from_attributes": True}

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class DepartmentCreate(BaseModel):
    name: str
    code: str
    head: Optional[str] = None
    parent_department_id: Optional[int] = None
    employee_count: int = 0
    status: str = "Active"

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    head: Optional[str] = None
    parent_department_id: Optional[int] = None
    employee_count: Optional[int] = None
    status: Optional[str] = None

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
    return TokenResponse(access_token=access_token)

@router.get("/me", response_model=EmployeeResponse)
def get_me(current_user: Employee = Depends(get_current_user)):
    return current_user

# --- Department Endpoints ---

from sqlmodel import select

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
