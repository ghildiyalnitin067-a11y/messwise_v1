from typing import Any, List, Optional, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Messwise API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./messwise.db"
    SYNC_DATABASE_URL: str = "sqlite:///./messwise.db"

    # JWT Security
    SECRET_KEY: str = "messwise-dev-super-secret-key-change-in-production"
    JWT_SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    JWT_ALGORITHM: Optional[str] = None
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # CORS (supports JSON array, comma-separated string, or wildcard)
    BACKEND_CORS_ORIGINS: Union[List[str], str] = ["*"]

    # Seed Data Flag
    AUTO_SEED_DATA: bool = True

    @field_validator("BACKEND_CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                try:
                    parsed = json.loads(v_stripped)
                    if isinstance(parsed, list):
                        return [str(o).strip() for o in parsed if str(o).strip()]
                except Exception:
                    pass
            return [origin.strip() for origin in v_stripped.split(",") if origin.strip()]
        elif isinstance(v, (list, tuple)):
            return [str(origin).strip() for origin in v if str(origin).strip()]
        return ["*"]

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        if url.startswith("postgresql://") and "+asyncpg" not in url:
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("sqlite:///") and "+aiosqlite" not in url:
            return url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
        return url

    @property
    def effective_sync_database_url(self) -> str:
        url = self.SYNC_DATABASE_URL or self.DATABASE_URL
        if "+aiosqlite" in url:
            return url.replace("+aiosqlite", "")
        if "+asyncpg" in url:
            return url.replace("+asyncpg", "")
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def effective_secret_key(self) -> str:
        return self.JWT_SECRET_KEY or self.SECRET_KEY

    @property
    def effective_algorithm(self) -> str:
        return self.JWT_ALGORITHM or self.ALGORITHM

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
