from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Legal Rights Awareness API"
    app_env: Literal["development", "test", "production"] = "development"
    log_level: str = "INFO"
    log_json: bool = False

    database_url: str = "postgresql+asyncpg://legal:legal@localhost:5432/legal_rights"
    redis_url: str = ""

    jwt_secret: SecretStr = SecretStr("")
    jwt_algorithm: str = "HS256"
    access_token_ttl_minutes: int = Field(15, ge=1)
    refresh_token_ttl_days: int = Field(14, ge=1)

    cors_origins: list[str] = ["http://localhost:3000"]

    max_request_bytes: int = Field(1_048_576, ge=1024)
    max_upload_bytes: int = Field(10_485_760, ge=1024)
    rate_limit_per_minute: int = Field(60, ge=1)

    llm_provider: Literal["ollama", "nvidia"] = "nvidia"
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_chat_model: str = "qwen3.5:4b"
    ollama_timeout_seconds: float = Field(120.0, gt=0)

    nvidia_api_key: SecretStr = SecretStr("")
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_chat_model: str = ""
    nvidia_embedding_model: str = ""
    embedding_dim: int = Field(1024, ge=1)
    nvidia_timeout_seconds: float = Field(60.0, gt=0)
    nvidia_max_retries: int = Field(3, ge=0, le=6)

    upload_retention_days: int = Field(30, ge=1)
    storage_dir: str = "storage"
    # Directory of catalogue JSONL corpora (one sub-directory per jurisdiction family).
    catalogue_dir: str = "data/corpus"

    @property
    def documents_dir(self) -> Path:
        return Path(self.storage_dir) / "documents"

    @model_validator(mode="after")
    def _production_guards(self) -> "Settings":
        if self.app_env == "production":
            if len(self.jwt_secret.get_secret_value()) < 32:
                raise ValueError("JWT_SECRET must be at least 32 characters in production")
            if "*" in self.cors_origins:
                raise ValueError("Wildcard CORS origin is not allowed in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
