from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from app.config import settings
from app.database import get_session
from app.modules.auth.models import Employee, Department

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

def authenticate_user(session: Session, email: str, password: str) -> Optional[Employee]:
    employee = session.exec(select(Employee).where(Employee.email == email)).first()
    if not employee or not verify_password(password, employee.password_hash):
        return None
    return employee

def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> Employee:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    employee = session.exec(select(Employee).where(Employee.email == email)).first()
    if employee is None:
        raise credentials_exception
    return employee

def get_optional_user(
    token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)),
    session: Session = Depends(get_session),
) -> Optional[Employee]:
    if token is None:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    return session.exec(select(Employee).where(Employee.email == email)).first()

def require_admin(current_user: Employee = Depends(get_current_user)) -> Employee:
    if current_user.role != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

def get_departments(session: Session) -> list[Department]:
    return session.exec(select(Department)).all()

def get_department(session: Session, department_id: int) -> Optional[Department]:
    return session.get(Department, department_id)

def create_department(session: Session, data: dict) -> Department:
    department = Department(**data)
    session.add(department)
    session.commit()
    session.refresh(department)
    return department

def update_department(session: Session, department: Department, data: dict) -> Department:
    for key, value in data.items():
        setattr(department, key, value)
    session.add(department)
    session.commit()
    session.refresh(department)
    return department

def delete_department(session: Session, department: Department) -> None:
    session.delete(department)
    session.commit()
