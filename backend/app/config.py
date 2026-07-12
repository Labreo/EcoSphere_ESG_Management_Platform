from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoSphere ESG Management Platform API"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "super-secret-key-for-jwt-signing-tokens-in-hackathon"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for convenience in hackathons
    
    # Database
    DATABASE_URL: str = "sqlite:///./ecosphere_esg.db"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
