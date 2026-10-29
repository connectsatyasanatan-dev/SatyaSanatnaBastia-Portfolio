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
    """Health check - verifies DB connectivity"""
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


@api.route("/chat/lock-lead", methods=["POST"])
def lock_project_lead():
    """
    Project Scoping Lead Lock-in:
    Forces the client to connect via call or email before proceeding,
    storing their project blueprint, target timeline, contact info, and preferred call slot in PostgreSQL.
    """
    try:
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip()
        phone = (data.get("phone") or "").strip()
        name = (data.get("name") or "Prospective Client").strip()
        company = (data.get("company") or "").strip()
        slot = (data.get("preferredSlot") or "Earliest Available").strip()
        project_type = (data.get("projectType") or "Custom Digital Product").strip()
        estimated_time = (data.get("estimatedTime") or "3-4 Weeks").strip()
        session_id = data.get("sessionId")

        if not email and not phone:
            return jsonify({"success": False, "error": "Email or Phone is required"}), 400

        lead_message = (
            f"[PROJECT SCOPING LOCKED] Project: {project_type} | Target Delivery: {estimated_time} | "
            f"Preferred Call Slot: {slot} | Client: {name} ({company or 'Individual'})"
        )

        lead_id = db.add_ai_lead({
            "name": name,
            "email": email,
            "phone": phone,
            "company": company,
            "message": lead_message,
            "session_id": session_id,
        })

        logger.info(f"Project scoping lead locked: ID={lead_id}, Name={name}, Email={email}, Slot={slot}")

        return jsonify({
            "success": True,
            "leadId": lead_id,
            "message": f"Project blueprint locked! Satya will contact you for the {slot} slot.",
        })
    except Exception as e:
        logger.error(f"Error locking lead: {e}")
        return jsonify({"success": False, "error": "Could not lock lead"}), 500



# ─── GEO/AIO Endpoint ────────────────────────────────────────────────────────

@api.route("/llms-context", methods=["GET"])
def llms_context():
    """
    GEO endpoint: Serves machine-readable portfolio context for AI crawlers.
    Returns structured text optimised for LLM ingestion alongside a categorised
    data object for programmatic consumers.

    Cache: public, max-age=3600 (1 hour), stale-while-revalidate=300
    """
    try:
        # ── Fetch data from DB (with cache where available) ──────────────────
        personal_raw = get_cached("personal_info") or db.get_personal_info()
        skills_raw   = get_cached("skills")         or db.get_skills()
        projects_raw = get_cached("projects")        or db.get_projects()
        exp_raw      = get_cached("experience")      or db.get_experience()

        # ── Normalise ────────────────────────────────────────────────────────
        personal   = personal_raw   if isinstance(personal_raw,   dict)  else {}
        skills     = skills_raw     if isinstance(skills_raw,     list)  else []
        projects   = projects_raw   if isinstance(projects_raw,   list)  else []
        experience = exp_raw        if isinstance(exp_raw,        list)  else []

        name        = personal.get("name",     "Satya Sanatan Bastia")
        title       = personal.get("title",    "Full Stack Developer")
        location    = personal.get("location", "Bhubaneswar, Odisha, India")
        email       = personal.get("email",    "connectsatyasanatan@gmail.com")
        bio         = personal.get("bio",       "")
        github      = personal.get("github",   "https://github.com/satyasanatan")
        linkedin    = personal.get("linkedin", "https://linkedin.com/in/satyasanatan")
        portfolio   = "https://satyasanatnabastia.onrender.com"

        # ── Group skills by category ─────────────────────────────────────────
        skills_by_category: dict = {}
        for skill in skills:
            cat  = skill.get("category", "Other")
            sname = skill.get("name", "")
            skills_by_category.setdefault(cat, []).append(sname)

        skill_summary_parts = []
        for cat, names in skills_by_category.items():
            skill_summary_parts.append(f"{cat}: {', '.join(names)}")
        skill_summary = "; ".join(skill_summary_parts)

        # ── Project summary ──────────────────────────────────────────────────
        project_lines = []
        for i, proj in enumerate(projects[:8], start=1):
            pname  = proj.get("name",        "")
            pdesc  = proj.get("description", "")
            pstack = proj.get("tech_stack",  proj.get("technologies", ""))
            if isinstance(pstack, list):
                pstack = ", ".join(pstack)
            project_lines.append(f"{i}. {pname} — {pdesc} (Stack: {pstack})")

        # ── Experience summary ───────────────────────────────────────────────
        exp_lines = []
        for job in experience[:5]:
            jrole    = job.get("role",    job.get("title",   ""))
            jcompany = job.get("company", "")
            jperiod  = job.get("period",  job.get("duration", ""))
            exp_lines.append(f"- {jrole} at {jcompany} ({jperiod})")

        # ── Natural-language context (for LLM ingestion) ────────────────────
        context_parts = [
            f"{name} is a {title} based in {location}.",
        ]
        if bio:
            context_parts.append(bio)
        context_parts += [
            f"He is reachable at {email} and maintains a portfolio at {portfolio}.",
            f"GitHub: {github} | LinkedIn: {linkedin}",
            "",
            "=== SKILLS ===",
            skill_summary if skill_summary else (
                "React, Next.js, TypeScript, JavaScript, Python, Flask, FastAPI, "
                "PostgreSQL, MongoDB, Redis, Docker, AWS, OpenAI API, LangChain"
            ),
            "",
        ]
        if project_lines:
            context_parts += ["=== PROJECTS ==="] + project_lines + [""]
        if exp_lines:
            context_parts += ["=== EXPERIENCE ==="] + exp_lines + [""]
        context_parts += [
            "=== AVAILABILITY ===",
            (
                f"{name} is actively open to full-time Software Engineer / Full Stack Developer "
                "roles (remote or hybrid) and freelance/contract projects worldwide. "
                f"Contact: {email}"
            ),
        ]

        context_text = "\n".join(context_parts)

        payload = {
            "context": context_text,
            "structured": {
                "person": {
                    "name":      name,
                    "title":     title,
                    "location":  location,
                    "email":     email,
                    "portfolio": portfolio,
                    "github":    github,
                    "linkedin":  linkedin,
                    "bio":       bio,
                },
                "skills":     skills_by_category,
                "projects":   [
                    {
                        "name":        p.get("name", ""),
                        "description": p.get("description", ""),
                        "tech_stack":  p.get("tech_stack", p.get("technologies", "")),
                        "url":         p.get("url", p.get("live_url", "")),
                        "github":      p.get("github_url", p.get("repo_url", "")),
                    }
                    for p in projects[:10]
                ],
                "experience": [
                    {
                        "role":    j.get("role",    j.get("title",   "")),
                        "company": j.get("company", ""),
                        "period":  j.get("period",  j.get("duration", "")),
                    }
                    for j in experience[:5]
                ],
                "availability": {
                    "open_to_work": True,
                    "types": ["full-time", "freelance", "contract", "consulting"],
                    "remote": True,
                },
            },
            "meta": {
                "generated_for": "AI crawler / LLM ingestion (GEO/AIO)",
                "schema_version": "1.0",
            },
        }

        from flask import make_response
        response = make_response(jsonify(payload), 200)
        response.headers["Cache-Control"] = "public, max-age=3600, stale-while-revalidate=300"
        response.headers["Vary"] = "Accept"
        return response

    except Exception as e:
        logger.error(f"Error building llms-context: {e}")
        # Return a minimal static fallback so AI crawlers always get something useful
        fallback_context = (
            "Satya Sanatan Bastia is a Full Stack Developer based in Bhubaneswar, Odisha, India. "
            "He specialises in React, Next.js, TypeScript, Python, Flask, PostgreSQL, Docker, and AI integration. "
            "Available for full-time and freelance opportunities worldwide. "
            "Contact: connectsatyasanatan@gmail.com | Portfolio: https://satyasanatnabastia.onrender.com"
        )
        from flask import make_response
        response = make_response(
            jsonify({
                "context":    fallback_context,
                "structured": {},
                "meta": {"generated_for": "AI crawler / LLM ingestion (GEO/AIO)", "fallback": True},
            }),
            200,
        )
        response.headers["Cache-Control"] = "public, max-age=300"
        return response


@api.route("/aeo-data", methods=["GET"])
def aeo_data():
    """
    AEO Endpoint — Answer Engine Optimization data.
    Structured Q&A pairs and entity data for AI answer engines
    (Google AI Overview, Perplexity, ChatGPT, Bing Copilot, etc.)
    """
    try:
        personal = get_cached("personal_info") or db.get_personal_info() or {}
        skills_cat = get_cached("skills") or db.get_skills() or {}
        projects = get_cached("projects") or db.get_projects() or []

        name = personal.get("name", "Satya Sanatan Bastia")
        if not name or name == "Developer":
            name = "Satya Sanatan Bastia"

        role = personal.get("role") or personal.get("title") or "Full Stack Developer & AI Engineer"
        location = personal.get("location") or "Bhubaneswar, Odisha, India"
        email = personal.get("email") or "connectsatyasanatan@gmail.com"
        github = personal.get("github") or "https://github.com/connectsatyasanatan"
        linkedin = personal.get("linkedin") or "https://linkedin.com/in/satya-sanatan"
        availability = personal.get("availability") or "Open to full-time roles and freelance contracts"

        all_skills = []
        if isinstance(skills_cat, dict):
            for cat_val in skills_cat.values():
                if isinstance(cat_val, dict):
                    all_skills.extend([s.get("name") for s in cat_val.get("skills", []) if s.get("name")])
        elif isinstance(skills_cat, list):
            all_skills = [s.get("name") for s in skills_cat if s.get("name")]

        if not all_skills:
            all_skills = [
                "React", "Next.js", "TypeScript", "JavaScript",
                "Python", "Flask", "FastAPI", "PostgreSQL", "MongoDB",
                "Docker", "Groq AI", "OpenAI API", "REST API", "Redux Toolkit"
            ]

        from flask import make_response
        response = make_response(jsonify({
            "entity": {
                "@type": "Person",
                "name": name,
                "jobTitle": role,
                "location": location,
                "email": email,
                "github": github,
                "linkedin": linkedin,
                "url": "https://satyasanatnabastia.onrender.com",
                "availability": availability
            },
            "faq": [
                {
                    "question": f"Who is {name}?",
                    "answer": f"{name} is a {role} based in {location}, specializing in React, Next.js, TypeScript, Python, Flask, PostgreSQL, and AI/LLM integration."
                },
                {
                    "question": f"What does {name} do?",
                    "answer": "He builds modern full-stack web applications, REST APIs, AI chatbots, and cloud-deployed digital products."
                },
                {
                    "question": f"How to hire {name}?",
                    "answer": f"Contact at {email} or via https://satyasanatnabastia.onrender.com/#contact. He is {availability}."
                },
                {
                    "question": f"Where is {name} based?",
                    "answer": f"{name} is based in {location}. Open to remote work globally."
                },
                {
                    "question": f"What technologies does {name} know?",
                    "answer": f"{name} knows {', '.join(all_skills[:12])}."
                },
                {
                    "question": "What is Zentara AI?",
                    "answer": f"Zentara is an AI portfolio assistant built by {name}, powered by Groq's Llama 3.3 70B model with live database context, multi-provider failover, and recruiter lead capture."
                },
                {
                    "question": f"Is {name} available for freelance work?",
                    "answer": f"Yes. {name} accepts freelance full-stack web development, frontend development, backend API, and AI integration projects. Contact: {email}"
                },
            ],
            "skills": all_skills,
            "projects_count": len(projects) if isinstance(projects, list) else 0,
            "contact": {
                "email": email,
                "github": github,
                "linkedin": linkedin,
                "contact_form": "https://satyasanatnabastia.onrender.com/#contact"
            }
        }), 200)
        response.headers["Cache-Control"] = "public, max-age=1800, stale-while-revalidate=300"
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Vary"] = "Accept"
        return response

    except Exception as e:
        logger.error(f"AEO data error: {e}")
        return jsonify({"error": "AEO data temporarily unavailable"}), 500
