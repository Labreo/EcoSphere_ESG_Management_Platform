from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoSphere ESG Management Platform API"
    API_V1_STR: str = "/api/v1"

    SECRET_KEY: str = "super-secret-key-for-jwt-signing-tokens-in-hackathon"
    JWT_REFRESH_SECRET: str = "super-secret-refresh-key-for-jwt-in-hackathon"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    DATABASE_URL: str = "sqlite:///./ecosphere_esg.db"

    GOOGLE_GEMINI_API_KEY: Optional[str] = None

    BREVO_API_KEY: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@ecosphere.com"
    SMTP_FROM_NAME: str = "EcoSphere Platform"

    IMAGEKIT_PUBLIC_KEY: Optional[str] = None
    IMAGEKIT_PRIVATE_KEY: Optional[str] = None
    IMAGEKIT_URL_ENDPOINT: Optional[str] = None

    REDIS_HOST: Optional[str] = None
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None

    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    CORS_ORIGINS: str = "*"
    DEBUG: bool = True
    PORT: int = 8000
    CLIENT_URL: str = "http://localhost:5500"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
