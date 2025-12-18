"""
Core configuration for the segmentation API.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    app_name: str = "Segmentation API"
    app_version: str = "0.1.0"
    debug: bool = True

    # Model settings
    model_path: str = "models/FastSAM-s.pt"

    # API settings
    host: str = "0.0.0.0"
    port: int = 8003

    class Config:
        env_prefix = "SEGMENTATION_API_"


settings = Settings()
