import jwt
import datetime
import os
import logging
import secrets
import hmac
from functools import wraps
from flask import request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Ensure .env is loaded whenever this module is imported
load_dotenv()

logger = logging.getLogger(__name__)

# Fast in-memory cache for revoked token JTIs (avoids hitting DB on every single micro-request)
_revoked_jti_cache: set[str] = set()

# JWT Standard Metadata
JWT_ISSUER = "portfolio-auth"
JWT_AUDIENCE = "portfolio-admin"


def _build_credentials():
    """Build admin credentials at startup - hashes password with bcrypt via werkzeug."""
    username = os.getenv("ADMIN_USERNAME")
    password = os.getenv("ADMIN_PASSWORD")
    email = os.getenv("ADMIN_EMAIL")

    if not password or not email or not username:
        raise ValueError("ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_EMAIL must be set in environment variables")

    if password == "Admin@123":
        logger.warning(
            "SECURITY WARNING: Default ADMIN_PASSWORD is in use. "
            "Set a strong password in your environment before deploying to production."
        )
    return {
        "username": username,
        "password_hash": generate_password_hash(password),
        "email": email,
        "role": "super_admin",
        "is_super_admin": True,
    }


def get_admin_credentials():
    global ADMIN_CREDENTIALS
    load_dotenv(override=True)
    username = os.getenv("ADMIN_USERNAME")
    if not ADMIN_CREDENTIALS or ADMIN_CREDENTIALS.get("username") != username:
        ADMIN_CREDENTIALS = _build_credentials()
    return ADMIN_CREDENTIALS


ADMIN_CREDENTIALS = _build_credentials()


def verify_username(plain_username: str) -> bool:
    """Constant-time comparison for username to prevent timing attacks."""
    if not plain_username:
        return False
    creds = get_admin_credentials()
    return hmac.compare_digest(plain_username.strip(), creds["username"])


def verify_password(plain_password: str) -> bool:
    """Verify plain password against bcrypt hash using constant-time comparison."""
    if not plain_password:
        return False
    creds = get_admin_credentials()
    return check_password_hash(creds["password_hash"], plain_password)


def _get_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET_KEY")
    if not secret:
        try:
            secret = current_app.config.get("JWT_SECRET_KEY") or current_app.config.get("SECRET_KEY")
        except Exception:
            secret = os.getenv("SECRET_KEY")
    if not secret:
        raise RuntimeError("JWT_SECRET_KEY is not configured.")
    return secret


def generate_access_token(username: str) -> str:
    """Generate 15-minute access token (type: access)."""
    minutes = int(os.getenv("JWT_ACCESS_TOKEN_MINUTES", 15))
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "sub": username,
        "username": username,
        "role": "super_admin",
        "is_super_admin": True,
        "type": "access",
        "jti": secrets.token_hex(16),
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "iat": now,
        "nbf": now,
        "exp": now + datetime.timedelta(minutes=minutes),
    }
    return jwt.encode(payload, _get_jwt_secret(), algorithm="HS256")


def generate_refresh_token(username: str) -> str:
    """Generate 1-day refresh token (type: refresh)."""
    days = int(os.getenv("JWT_REFRESH_TOKEN_DAYS", 1))
    now = datetime.datetime.now(datetime.timezone.utc)
    payload = {
        "sub": username,
        "username": username,
        "role": "super_admin",
        "is_super_admin": True,
        "type": "refresh",
        "jti": secrets.token_hex(16),
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
        "iat": now,
        "nbf": now,
        "exp": now + datetime.timedelta(days=days),
    }
    return jwt.encode(payload, _get_jwt_secret(), algorithm="HS256")


def create_token_pair(username: str) -> dict:
    """Generate a full token pair (15m access token + 1d refresh token)."""
    access_token = generate_access_token(username)
    refresh_token = generate_refresh_token(username)
    access_minutes = int(os.getenv("JWT_ACCESS_TOKEN_MINUTES", 15))
    return {
        "accessToken": access_token,
        "token": access_token,  # backwards compatibility
        "refreshToken": refresh_token,
        "tokenType": "Bearer",
        "expiresIn": access_minutes * 60,
    }


def generate_token(username: str) -> str:
    """Backwards-compatible wrapper: returns standard 15-minute access token."""
    return generate_access_token(username)


def is_jti_revoked(jti: str) -> bool:
    """Check if JTI is in revocation cache or database."""
    if not jti:
        return False
    if jti in _revoked_jti_cache:
        return True
    try:
        from models.database import db
        if db.is_token_revoked(jti):
            _revoked_jti_cache.add(jti)
            return True
    except Exception as e:
        logger.debug(f"DB revocation lookup error: {e}")
    return False


def revoke_jti(jti: str, token_type: str = "unknown", username: str = "", expires_at: datetime.datetime | None = None) -> bool:
    """Blacklist a JTI in cache and database."""
    if not jti:
        return False
    _revoked_jti_cache.add(jti)
    if expires_at is None:
        expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=2)
    try:
        from models.database import db
        return db.revoke_token(jti, token_type, username or ADMIN_CREDENTIALS["username"], expires_at)
    except Exception as e:
        logger.error(f"Failed to persist revoked token to DB: {e}")
        return True  # still cached in memory


def revoke_raw_token(token: str) -> bool:
    """Decode token (even if expired) and blacklist its JTI."""
    try:
        # Decode without verification just to extract claims for revocation
        unverified = jwt.decode(token, options={"verify_signature": False, "verify_exp": False})
        jti = unverified.get("jti")
        token_type = unverified.get("type", "unknown")
        username = unverified.get("username") or unverified.get("sub", "")
        exp_ts = unverified.get("exp")
        expires_at = (
            datetime.datetime.fromtimestamp(exp_ts, tz=datetime.timezone.utc)
            if exp_ts
            else datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=2)
        )
        if jti:
            return revoke_jti(jti, token_type=token_type, username=username, expires_at=expires_at)
    except Exception as e:
        logger.warning(f"Could not parse token for revocation: {e}")
    return False


def decode_and_verify_token(token: str, expected_type: str = "access") -> tuple[dict | None, str | None]:
    """
    Decodes and enforces strict security validation on a JWT:
    - Algorithm strictly HS256
    - Signature validation
    - Expiration check
    - Issuer & Audience check
    - Required claims check (exp, iat, jti, type, sub)
    - Expected token type check (access vs refresh)
    - Blacklist / revocation check
    Returns (payload, error_message).
    """
    try:
        secret = _get_jwt_secret()
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            issuer=JWT_ISSUER,
            audience=JWT_AUDIENCE,
            options={
                "require": ["exp", "iat", "jti", "type", "sub"],
                "verify_exp": True,
                "verify_iat": True,
                "verify_iss": True,
                "verify_aud": True,
            },
        )

        # Check token type (prevents passing refresh token directly as access token)
        token_type = payload.get("type")
        if expected_type and token_type != expected_type:
            logger.warning(f"JWT token type mismatch: expected {expected_type}, got {token_type}")
            return None, f"Invalid token type: {expected_type} token required"

        # Check revocation blacklist
        jti = payload.get("jti")
        if is_jti_revoked(jti):
            logger.warning(f"Revoked token usage attempt: jti={jti}, user={payload.get('username')}")
            return None, "Token has been revoked"

        return payload, None

    except jwt.ExpiredSignatureError:
        logger.info("JWT token has expired")
        return None, "Token has expired"
    except jwt.InvalidIssuerError:
        logger.warning("JWT invalid issuer")
        return None, "Invalid token issuer"
    except jwt.InvalidAudienceError:
        logger.warning("JWT invalid audience")
        return None, "Invalid token audience"
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT token: {e}")
        return None, f"Invalid token: {e}"


def verify_token(token: str) -> str | None:
    """Backwards-compatible helper: verifies access token and returns username or None."""
    payload, error = decode_and_verify_token(token, expected_type="access")
    if payload:
        return payload.get("username") or payload.get("sub")
    return None


def admin_required(f):
    """
    High-security decorator to require verified admin access token.
    Blocks expired, invalid, revoked, or refresh tokens from accessing protected endpoints.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header:
            return jsonify({"error": "Authorization header missing", "code": "TOKEN_MISSING"}), 401

        token = auth_header[7:].strip() if auth_header.startswith("Bearer ") else auth_header.strip()
        if not token:
            return jsonify({"error": "Token missing from Authorization header", "code": "TOKEN_MISSING"}), 401

        payload, error_msg = decode_and_verify_token(token, expected_type="access")
        if not payload:
            return jsonify({
                "error": error_msg or "Invalid or expired access token",
                "code": "TOKEN_EXPIRED" if error_msg == "Token has expired" else "TOKEN_INVALID"
            }), 401

        # Store authenticated admin user and jti on request context
        request.admin_user = payload.get("username")
        request.token_jti = payload.get("jti")
        request.token_payload = payload

        return f(*args, **kwargs)

    return decorated_function
