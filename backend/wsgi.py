#!/usr/bin/env python3
"""
wsgi.py — WSGI entry point for production servers (gunicorn, uWSGI).

Usage:
  Development:  python wsgi.py
  Production:   gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 4
"""

from app import create_app

app = create_app()

if __name__ == "__main__":
    import os

    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "development") == "development"

    print(f"STARTING: Flask API on http://0.0.0.0:{port}")
    print(f"CORS: Allowed origins: {app.config['CORS_ORIGINS']}")
    print(f"DEBUG: Mode is {debug}")

    app.run(debug=debug, host="0.0.0.0", port=port)
