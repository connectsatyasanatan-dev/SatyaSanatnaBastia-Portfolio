"""
config.py - Flask configuration
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

    # Validate secrets at startup - enforces environment variables in production and ephemeral random keys in dev
    @classmethod
    def validate_production_secrets(cls):
        import logging as _logging
        import secrets as _secrets

        _log = _logging.getLogger(__name__)
        is_prod = cls.FLASK_ENV == "production"

        if not cls.SECRET_KEY or cls.SECRET_KEY == "dev-secret-key-change-in-production":
            if is_prod:
                raise RuntimeError("CRITICAL: Production SECRET_KEY must be configured in environment variables.")
            cls.SECRET_KEY = _secrets.token_hex(32)
            _log.warning("Generated ephemeral SECRET_KEY for local development.")
        
        jwt_key = os.environ.get("JWT_SECRET_KEY", "")
        if not jwt_key or jwt_key == "dev-jwt-secret-change-in-production" or len(jwt_key) < 32:
            if is_prod:
                raise RuntimeError("CRITICAL: Production JWT_SECRET_KEY (min 32 chars) must be configured in environment variables.")
            cls.JWT_SECRET_KEY = _secrets.token_hex(32)
            _log.warning("Generated ephemeral JWT_SECRET_KEY for local development.")

    # ------------------------------------------------------------------ #
    # CORS - comma-separated list of allowed origins
    # Example (local):      http://localhost:3000
    # Example (production): https://your-portfolio.com
    # ------------------------------------------------------------------ #
    _cors_origins_raw: str = os.environ.get(
        "CORS_ORIGINS", "*"
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
