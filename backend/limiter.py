"""
limiter.py - Shared Flask-Limiter instance.
Import this in app.py to init_app() and in routes to apply decorators.
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Global rate limiter with safe defaults (200 requests/min per IP)
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per minute", "2000 per hour"]
)
