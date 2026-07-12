import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db

logger = logging.getLogger(__name__)

# Import Routers
from app.modules.auth.router import router as auth_router
from app.modules.auth.router import dept_router
from app.modules.auth.router import users_router
from app.modules.settings.router import router as settings_router
from app.modules.settings.router import notifications_router
from app.modules.environmental.router import router as environmental_router
from app.modules.social.router import router as social_router
from app.modules.social.training_router import router as training_router
from app.modules.governance.router import router as governance_router
from app.modules.gamification.router import router as gamification_router
from app.modules.reports.router import router as reports_router
from app.modules.chatbot.router import router as chatbot_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend services for measuring, managing, and improving ESG performance.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for hackathon convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database initialization on startup
@app.on_event("startup")
def on_startup():
    from sqlmodel import Session, select
    from app.database import engine
    from app.modules.auth.models import Employee

    init_db()

    # Auto-seed check: ensure demo accounts exist
    try:
        with Session(engine) as session:
            admin = session.exec(select(Employee).where(Employee.email == "admin@ecosphere.com")).first()
            if not admin:
                from app.database import seed_initial_data
                seed_initial_data()
                logger.info("Auto-seeded demo data successfully")
    except Exception as e:
        logger.error(f"Auto-seed check failed: {e}")

# Include Routers under standard API v1 path
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dept_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(environmental_router, prefix=settings.API_V1_STR)
app.include_router(social_router, prefix=settings.API_V1_STR)
app.include_router(training_router, prefix=settings.API_V1_STR)
app.include_router(governance_router, prefix=settings.API_V1_STR)
app.include_router(gamification_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(chatbot_router, prefix=settings.API_V1_STR)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "docs": "/docs"
    }
