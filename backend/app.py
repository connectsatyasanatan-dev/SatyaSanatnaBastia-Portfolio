"""
app.py - Flask application factory
Pure REST API backend - no template rendering.
All HTML is served by the Next.js / Vite frontend.
"""

import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_mail import Mail

from config import Config
from routes.api import api
from routes.admin import admin
from limiter import limiter

# Structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Suppress external third-party HTTP client logs to protect architecture secrecy
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

# Rate limiter - shared instance, attached to app in factory
# (defined in limiter.py to avoid circular imports)


def create_app(config_class: type = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Validate secrets in production - raises RuntimeError if misconfigured
    config_class.validate_production_secrets()

    # Trust reverse proxy headers (Next.js / Cloudflare / Nginx) for real client IP extraction
    from werkzeug.middleware.proxy_fix import ProxyFix
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

    # ------------------------------------------------------------------
    # Extensions
    # ------------------------------------------------------------------
    CORS(
        app,
        origins=app.config["CORS_ORIGINS"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        supports_credentials=True,
    )
    Mail(app)
    limiter.init_app(app)

    # ------------------------------------------------------------------
    # Blueprints
    # ------------------------------------------------------------------
    app.register_blueprint(api, url_prefix="/api")
    app.register_blueprint(admin, url_prefix="/api/admin")

    # ------------------------------------------------------------------
    # Root - API index
    # ------------------------------------------------------------------
    @app.route("/")
    def index():
        return jsonify(
            {
                "message": "Portfolio Flask Backend API",
                "version": "1.0.0",
                "status": "running",
                "endpoints": {
                    "health": "GET  /api/health",
                    "personal_info": "GET  /api/personal-info",
                    "skills": "GET  /api/skills",
                    "projects": "GET  /api/projects",
                    "experience": "GET  /api/experience",
                    "education": "GET  /api/education",
                    "certifications": "GET  /api/certifications",
                    "achievements": "GET  /api/achievements",
                    "testimonials": "GET  /api/testimonials",
                    "blog": "GET  /api/blog",
                    "contact": "POST /api/contact",
                    "stats": "GET  /api/stats",
                    "admin_login": "POST /api/admin/login",
                },
            }
        )

    # ------------------------------------------------------------------
    # Error handlers - always return JSON
    # ------------------------------------------------------------------
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad request", "details": str(error)}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized"}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden"}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(429)
    def too_many_requests(error):
        return jsonify({"error": "Too many requests. Please slow down."}), 429

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({"error": "Internal server error"}), 500

    # ------------------------------------------------------------------
    # Request logging middleware
    # ------------------------------------------------------------------
    @app.after_request
    def add_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Author"] = "Satya Sanatan Bastia"
        response.headers["X-Copyright"] = "Copyright (c) Satya Sanatan Bastia. All Rights Reserved."
        # HSTS - only meaningful over HTTPS; safe to set always
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        # Strip server footprint headers
        response.headers.pop("Server", None)
        response.headers.pop("X-Powered-By", None)
        return response

    logger.info("Flask app created successfully")
    return app
