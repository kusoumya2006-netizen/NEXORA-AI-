import os

class Settings:
    PROJECT_NAME: str = "NEXORA"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    MODEL_MODE: str = os.getenv("MODEL_MODE", "mock").lower()  # mock | real | hybrid
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./nexora.db")
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

settings = Settings()
