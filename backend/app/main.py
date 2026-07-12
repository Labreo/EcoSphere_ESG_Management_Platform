from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db

# Import Routers
from app.modules.auth.router import router as auth_router
from app.modules.auth.router import dept_router
from app.modules.settings.router import router as settings_router
from app.modules.environmental.router import router as environmental_router
from app.modules.social.router import router as social_router
from app.modules.governance.router import router as governance_router
from app.modules.gamification.router import router as gamification_router
from app.modules.reports.router import router as reports_router

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
    init_db()

# Include Routers under standard API v1 path
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(dept_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(environmental_router, prefix=settings.API_V1_STR)
app.include_router(social_router, prefix=settings.API_V1_STR)
app.include_router(governance_router, prefix=settings.API_V1_STR)
app.include_router(gamification_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "docs": "/docs"
    }
