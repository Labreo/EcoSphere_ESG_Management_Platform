from sqlmodel import SQLModel, create_engine, Session
from app.config import settings

# For SQLite, we need connect_args={"check_same_thread": False}
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, echo=True, connect_args=connect_args)

def init_db():
    # Import all models here so they register with SQLModel metadata
    from app.modules.auth.models import Department, Employee
    from app.modules.settings.models import Category, DepartmentScore
    from app.modules.environmental.models import EmissionFactor, ProductESGProfile, EnvironmentalGoal, CarbonTransaction
    from app.modules.social.models import CSRActivity, EmployeeParticipation
    from app.modules.governance.models import ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue
    from app.modules.gamification.models import Badge, Reward, Challenge, ChallengeParticipation
    
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
