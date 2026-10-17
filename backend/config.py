"""
config.py — Flask configuration
Reads all settings from environment variables (backed by .env via python-dotenv).
Never hard-code secrets here; use .env for local development.
"""

import os
from dotenv import load_dotenv

# Load .env only in development; in production env vars come from the platform.
load_dotenv()


class Config:
    # ------------------------------------------------------------------ #
    # Core Flask
    # ------------------------------------------------------------------ #
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "")
    FLASK_ENV: str = os.environ.get("FLASK_ENV", "development")
    DEBUG: bool = FLASK_ENV == "development"

    # Warn at import time if insecure defaults are detected in production
    @classmethod
    def validate_production_secrets(cls):
        import logging as _logging

        _log = _logging.getLogger(__name__)
        if cls.FLASK_ENV == "production":
            if (
                not cls.SECRET_KEY
                or cls.SECRET_KEY == "dev-secret-key-change-in-production"
            ):
                raise RuntimeError(
                    "FATAL: SECRET_KEY is not set or is using the default dev value. "
                    "Set a strong random SECRET_KEY environment variable before deploying."
                )
            jwt_key = os.environ.get("JWT_SECRET_KEY", "")
            if not jwt_key or jwt_key == "dev-jwt-secret-change-in-production" or len(jwt_key) < 32:
                raise RuntimeError(
                    "FATAL: JWT_SECRET_KEY is not set, is using the default dev value, or is too short (< 32 characters). "
                    "Set a strong random JWT_SECRET_KEY environment variable before deploying."
                )
        elif not cls.SECRET_KEY:
            cls.SECRET_KEY = "dev-secret-key-change-in-production"
            _log.warning(
                "SECRET_KEY not set — using insecure dev default. Set it before production."
            )

    # ------------------------------------------------------------------ #
    # CORS — comma-separated list of allowed origins
    # Example (local):      http://localhost:3000
    # Example (production): https://your-portfolio.com
    # ------------------------------------------------------------------ #
    _cors_origins_raw: str = os.environ.get(
        "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
    )
    CORS_ORIGINS: list[str] = [
        o.strip() for o in _cors_origins_raw.split(",") if o.strip()
    ]

    # ------------------------------------------------------------------ #
    # Email / Contact form
    # ------------------------------------------------------------------ #
    MAIL_SERVER: str = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT: int = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS: bool = os.environ.get("MAIL_USE_TLS", "true").lower() in (
        "true",
        "on",
        "1",
    )
    MAIL_USERNAME: str | None = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD: str | None = os.environ.get("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER: str | None = os.environ.get("MAIL_DEFAULT_SENDER")

    # ------------------------------------------------------------------ #
    # Admin credentials (stored in env, not in source code)
    # ------------------------------------------------------------------ #
    ADMIN_USERNAME: str = os.environ.get("ADMIN_USERNAME", "Admin")
    ADMIN_PASSWORD: str = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    ADMIN_EMAIL: str = os.environ.get("ADMIN_EMAIL", "admin@portfolio.dev")

    # ------------------------------------------------------------------ #
    # JWT
    # ------------------------------------------------------------------ #
    JWT_SECRET_KEY: str = os.environ.get("JWT_SECRET_KEY", "") or SECRET_KEY
    JWT_ACCESS_TOKEN_MINUTES: int = int(os.environ.get("JWT_ACCESS_TOKEN_MINUTES", 15))
    JWT_REFRESH_TOKEN_DAYS: int = int(os.environ.get("JWT_REFRESH_TOKEN_DAYS", 1))

    # ------------------------------------------------------------------ #
    # Uploads
    # ------------------------------------------------------------------ #
    UPLOAD_FOLDER: str = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "static/uploads"
    )
    MAX_CONTENT_LENGTH: int = 16 * 1024 * 1024  # 16MB limit
