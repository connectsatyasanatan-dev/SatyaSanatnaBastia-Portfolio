from models.database import db, get_connection
from flask_mail import Message
from cache import get_cached, set_cache, invalidate_cache
import requests
import os
import logging
from flask import Blueprint, jsonify, request, current_app, send_from_directory
from limiter import limiter

api = Blueprint("api", __name__)
logger = logging.getLogger(__name__)


@api.route("/health", methods=["GET"])
def health_check():
    """Health check — verifies DB connectivity"""
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {e}"

    return jsonify(
        {
            "status": "healthy" if db_status == "connected" else "degraded",
            "database": db_status,
            "message": "Flask backend is running!",
        }
    ), (200 if db_status == "connected" else 503)


@api.route("/personal-info", methods=["GET"])
def get_personal_info():
    cached = get_cached("personal_info")
    if cached:
        return jsonify(cached)
    data = db.get_personal_info()
    set_cache("personal_info", data)
    return jsonify(data)


@api.route("/skills", methods=["GET"])
def get_skills():
    cached = get_cached("skills")
    if cached:
        return jsonify(cached)
    data = db.get_skills()
    set_cache("skills", data)
    return jsonify(data)


@api.route("/skills/<category>", methods=["GET"])
def get_skills_by_category(category):
    """Get skills by category (frontend, backend, database, cloud)"""
    skills = db.get_skills()
    if category in skills:
        return jsonify(skills[category])
    return jsonify({"error": "Category not found"}), 404


@api.route("/projects", methods=["GET"])
def get_projects():
    cached = get_cached("projects")
    if cached is None:
        cached = db.get_projects()
        set_cache("projects", cached)
    featured_only = request.args.get("featured", "false").lower() == "true"
    if featured_only:
        return jsonify([p for p in cached if p.get("featured", False)])
    return jsonify(cached)


@api.route("/projects/<int:project_id>", methods=["GET"])
def get_project(project_id):
    """Get specific project by ID"""
    projects = db.get_projects()
    project = next((p for p in projects if p["id"] == project_id), None)
    if project:
        return jsonify(project)
    return jsonify({"error": "Project not found"}), 404


@api.route("/experience", methods=["GET"])
def get_experience():
    cached = get_cached("experience")
    if cached:
        return jsonify(cached)
    data = db.get_experience()
    set_cache("experience", data)
    return jsonify(data)


@api.route("/education", methods=["GET"])
def get_education():
    cached = get_cached("education")
    if cached:
        return jsonify(cached)
    data = db.get_education()
    set_cache("education", data)
    return jsonify(data)


@api.route("/certifications", methods=["GET"])
def get_certifications():
    cached = get_cached("certifications")
    if cached:
        return jsonify(cached)
    data = db.get_certifications()
    set_cache("certifications", data)
    return jsonify(data)


@api.route("/achievements", methods=["GET"])
def get_achievements():
    cached = get_cached("achievements")
    if cached:
        return jsonify(cached)
    data = db.get_achievements()
    set_cache("achievements", data)
    return jsonify(data)


@api.route("/testimonials", methods=["GET"])
def get_testimonials():
    cached = get_cached("testimonials")
    if cached:
        return jsonify(cached)
    data = db.get_testimonials()
    set_cache("testimonials", data)
    return jsonify(data)


@api.route("/blog", methods=["GET"])
def get_blog_posts():
    cached = get_cached("blog")
    if cached is None:
        cached = db.get_blog_posts()
        set_cache("blog", cached)
    featured_only = request.args.get("featured", "false").lower() == "true"
    if featured_only:
        return jsonify([p for p in cached if p.get("featured", False)])
    return jsonify(cached)


@api.route("/contact", methods=["POST"])
@limiter.limit("5 per minute; 20 per hour")
def contact_form():
    """Handle contact form submission: validate, save to DB, send email."""
    try:
        data = request.get_json() or {}

        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip()
        subject = (data.get("subject") or "Portfolio Contact Form").strip()
        message_text = (data.get("message") or "").strip()

        # Validation
        import re

        errors = []
        if not name or len(name) < 2:
            errors.append("Name must be at least 2 characters")
        if len(name) > 100:
            errors.append("Name too long (max 100 chars)")
        if not email or not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
            errors.append("Valid email required")
        if not message_text or len(message_text) < 10:
            errors.append("Message must be at least 10 characters")
        if len(message_text) > 2000:
            errors.append("Message too long (max 2000 chars)")
        if errors:
            return jsonify({"error": "; ".join(errors)}), 400

        # Truncate subject
        subject = subject[:200]

        db.add_contact_message(
            name=name, email=email, subject=subject, message=message_text
        )

        # Send email (non-blocking failure)
        personal_info = db.get_personal_info()
        owner_email = (personal_info.get("email") or "").strip()
        if owner_email and current_app.extensions.get("mail"):
            try:
                mail = current_app.extensions["mail"]
                msg = Message(
                    subject=f"[Portfolio] {subject}",
                    recipients=[owner_email],
                    body=(
                        f"New message from your portfolio contact form\n\n"
                        f"From: {name} <{email}>\n"
                        f"Subject: {subject}\n\n"
                        f"Message:\n{message_text}"
                    ),
                )
                mail.send(msg)
            except Exception as mail_err:
                logger.warning(f"Contact form email failed: {mail_err}")

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Thank you! I'll get back to you soon.",
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Contact form error: {e}")
        return jsonify({"error": "Failed to process contact form"}), 500


@api.route("/stats", methods=["GET"])
def get_stats():
    """Get portfolio statistics"""
    projects = db.get_projects()
    skills = db.get_skills()
    testimonials = db.get_testimonials()
    blog_posts = db.get_blog_posts()
    achievements = db.get_achievements()
    stats_data = achievements.get("stats", {})

    # Public visitor count from analytics table
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(DISTINCT visitor_id) FROM analytics")
        row = cursor.fetchone()
        unique_visitors = row[0] if row else 0
        cursor.close()
        conn.close()
    except Exception:
        unique_visitors = 0

    stats = {
        "projects_count": stats_data.get("projectsCompleted", len(projects)),
        "featured_projects": len([p for p in projects if p.get("featured", False)]),
        "total_stars": sum(p.get("stars", 0) for p in projects),
        "total_forks": sum(p.get("forks", 0) for p in projects),
        "experience_years": stats_data.get("yearsOfExperience", 0),
        "skills_count": sum(len(category["skills"]) for category in skills.values()),
        "testimonials_count": len(testimonials),
        "blog_posts_count": len(blog_posts),
        "clients_satisfied": stats_data.get("clientsSatisfied", 0),
        "code_commits": stats_data.get("codeCommits", 0),
        "lines_of_code": stats_data.get("linesOfCode", 0),
        "coffee_consumed": stats_data.get("coffeeConsumed", 0),
        "unique_visitors": unique_visitors,
    }
    return jsonify(stats)


def get_location_from_ip(ip):
    """Get location info from IP address using ip-api.com"""
    try:
        # Skip local IP
        if ip == "127.0.0.1" or ip.startswith("192.168.") or ip.startswith("10."):
            return "Local", "Local"

        response = requests.get(f"http://ip-api.com/json/{ip}", timeout=5)
        data = response.json()
        if data.get("status") == "success":
            return data.get("country"), data.get("city")
    except Exception as e:
        print(f"GeoIP error: {e}")
    return "Unknown", "Unknown"


@api.route("/track-visit", methods=["POST"])
@limiter.limit("30 per minute")
def track_visit():
    """Track a new visit session"""
    try:
        data = request.get_json()
        if not data or not data.get("visitorId") or not data.get("sessionId"):
            return jsonify({"error": "Missing visitorId or sessionId"}), 400

        # Get IP address
        ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        if ip and "," in ip:
            ip = ip.split(",")[0].strip()

        country, city = get_location_from_ip(ip) if ip else ("Unknown", "Unknown")

        visit_data = {
            "visitor_id": data.get("visitorId"),
            "session_id": data.get("sessionId"),
            "ip_address": ip,
            "device_type": data.get("deviceType"),
            "browser": data.get("browser"),
            "referrer": data.get("referrer"),
            "page_path": data.get("pagePath", "/"),
            "location_country": country,
            "location_city": city,
        }

        db.track_visit(visit_data)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/track-duration", methods=["POST"])
@limiter.limit("60 per minute")
def track_duration():
    """Update session duration"""
    try:
        data = request.get_json()
        session_id = data.get("sessionId")
        duration = data.get("duration")

        if not session_id:
            return jsonify({"error": "Missing sessionId"}), 400

        db.update_duration(session_id, duration)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/static/uploads/<filename>", methods=["GET"])
def serve_uploaded_file(filename):
    """Serve files uploaded via the admin panel"""
    # Use UPLOAD_FOLDER from config or fallback to relative path
    upload_dir = current_app.config.get(
        "UPLOAD_FOLDER", os.path.join(current_app.root_path, "static/uploads")
    )
    return send_from_directory(upload_dir, filename)


# ── AI Assistant (Zentara) ───────────────────────────────────────────
@api.route("/chat", methods=["POST"])
@limiter.limit("15 per minute; 60 per hour")
def chat_ai():
    """
    AI Portfolio Assistant (Zentara) endpoint.
    Powered by Groq Llama 3.3 with real-time PostgreSQL context, data-rich fallback,
    and automated conversation/recruiter-lead logging.
    """
    try:
        data = request.get_json(silent=True) or {}
        message = (data.get("message") or "").strip()
        history = data.get("history") or []
        client_hour = data.get("hour", -1)
        session_id = data.get("sessionId")

        if not message:
            return jsonify({"error": "Message is required", "response": "Please enter a message."}), 400

        from services.ai_service import get_ai_response
        result = get_ai_response(
            user_message=message,
            history=history,
            client_hour=client_hour,
            db=db,
        )

        # If visitor provided their personal/contact details, store specifically in ai_leads
        try:
            lead = result.get("lead")
            if lead and lead.get("has_lead"):
                db.add_ai_lead({
                    "name": lead.get("name"),
                    "email": lead.get("email"),
                    "phone": lead.get("phone"),
                    "company": lead.get("company"),
                    "message": message,
                    "session_id": session_id,
                })
        except Exception as lead_err:
            logger.warning(f"Could not save AI lead: {lead_err}")

        return jsonify(result)
    except Exception as e:
        logger.error(f"Chat error: {e}")
        from services.ai_service import generate_smart_fallback
        fallback = generate_smart_fallback(request.get_json(silent=True).get("message", ""), db)
        try:
            lead = fallback.get("lead")
            if lead and lead.get("has_lead"):
                db.add_ai_lead({
                    "name": lead.get("name"),
                    "email": lead.get("email"),
                    "phone": lead.get("phone"),
                    "company": lead.get("company"),
                    "message": request.get_json(silent=True).get("message", ""),
                    "session_id": request.get_json(silent=True).get("sessionId"),
                })
        except Exception:
            pass
        return jsonify(fallback)

