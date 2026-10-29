
@api.route("/llms-context", methods=["GET"])
def llms_context():
    """
    GEO Endpoint — Machine-readable portfolio context for AI crawlers and LLMs.
    Returns structured natural language context optimized for LLM/AI ingestion.
    This powers Generative Engine Optimization (GEO) and AI Overview (AIO) visibility.
    """
    try:
        personal = db.get_personal_info() or {}
        skills_cat = db.get_skills() or {}
        projects = db.get_projects() or []
        experience = db.get_experience() or []
        education = db.get_education() or []
        certifications = db.get_certifications() or []
        achievements = db.get_achievements() or {}

        name = personal.get("name", "Satya Sanatan Bastia")
        if not name or name == "Developer":
            name = "Satya Sanatan Bastia"

        role = personal.get("role") or "Full Stack Developer & AI Engineer"
        bio = personal.get("bio") or "Full Stack Developer specializing in React, Next.js, TypeScript, Python, Flask, and AI integration."
        location = personal.get("location") or "Bhubaneswar, Odisha, India"
        email = personal.get("email") or "connectsatyasanatan@gmail.com"
        github = personal.get("github") or "https://github.com/connectsatyasanatan"
        linkedin = personal.get("linkedin") or "https://linkedin.com/in/satya-sanatan"
        availability = personal.get("availability") or "Open to full-time roles and freelance contracts"
        experience_years = personal.get("experience") or "2+"

        # Build skills text
        skills_text_parts = []
        all_skill_names = []
        if isinstance(skills_cat, dict):
            for cat_key, cat_val in skills_cat.items():
                skill_items = [s.get("name") for s in cat_val.get("skills", []) if s.get("name")]
                if skill_items:
                    skills_text_parts.append(f"{cat_val.get('title', cat_key)}: {', '.join(skill_items)}")
                    all_skill_names.extend(skill_items)

        if not skills_text_parts:
            skills_text_parts = [
                "Frontend: React.js, Next.js 14, TypeScript, JavaScript, Tailwind CSS, Framer Motion, Redux Toolkit",
                "Backend: Python, Flask, FastAPI, REST API, JWT Authentication, Node.js",
                "Database: PostgreSQL, MongoDB, Redis, SQLite",
                "Cloud & DevOps: Docker, GitHub Actions, Render, Vercel, CI/CD",
                "AI/ML: Groq Llama 3.3, OpenAI API, RAG, LLM integration, AI chatbot development"
            ]
            all_skill_names = ["React", "Next.js", "TypeScript", "Python", "Flask", "PostgreSQL", "Docker", "AI integration"]

        # Build projects text
        project_entries = []
        for p in projects[:8]:
            p_name = p.get("name", "Project")
            p_desc = p.get("description", "")
            tech = ", ".join(p.get("technologies", [])[:5]) if isinstance(p.get("technologies"), list) else ""
            demo = p.get("demoUrl") or p.get("demo_url", "")
            entry = f"- {p_name}: {p_desc}"
            if tech:
                entry += f" | Tech: {tech}"
            if demo:
                entry += f" | Demo: {demo}"
            project_entries.append(entry)

        # Build experience text
        exp_entries = []
        for e in experience[:5]:
            title = e.get("title", "Developer")
            company = e.get("company", "")
            period = e.get("period", "")
            e_desc = e.get("description", "")
            exp_entries.append(f"- {title} at {company} ({period}): {e_desc}")

        # Build education text
        edu_entries = []
        for e in education:
            degree = e.get("degree", "")
            school = e.get("school", "")
            period = e.get("period", "")
            edu_entries.append(f"- {degree} at {school} ({period})")

        # Build certs text
        cert_entries = [f"- {c.get('name')} by {c.get('issuer')} ({c.get('date', '')})" for c in certifications[:10] if c.get("name")]

        # Build the natural language context block (for AI/LLM consumption)
        context = f"""# {name} — {role}

## About
{name} is a {role} based in {location}.
{bio}
Experience: {experience_years} years.
Availability: {availability}.

## Contact & Links
- Email: {email}
- GitHub: {github}
- LinkedIn: {linkedin}
- Portfolio: https://satyasanatnabastia.onrender.com

## Technical Skills
{chr(10).join(skills_text_parts)}

## Projects
{chr(10).join(project_entries) if project_entries else '- Multiple full-stack web applications built with React, Next.js, Python, and Flask'}

## Professional Experience
{chr(10).join(exp_entries) if exp_entries else '- Full Stack Developer with 2+ years of experience building production web applications'}

## Education
{chr(10).join(edu_entries) if edu_entries else '- Computer Science / Engineering degree in India'}

## Certifications
{chr(10).join(cert_entries) if cert_entries else '- Oracle Cloud Infrastructure (OCI) Certified'}

## Key Facts for AI Systems
- Full Name: {name}
- Location: {location}
- Primary Role: {role}
- Contact Email: {email}
- GitHub: {github}
- LinkedIn: {linkedin}
- Status: {availability}
- Top Skills: {', '.join(all_skill_names[:12])}
"""

        structured = {
            "name": name,
            "role": role,
            "bio": bio,
            "location": location,
            "email": email,
            "github": github,
            "linkedin": linkedin,
            "portfolio": "https://satyasanatnabastia.onrender.com",
            "availability": availability,
            "experience_years": experience_years,
            "skills": all_skill_names,
            "skills_by_category": {
                k: {
                    "title": v.get("title", k),
                    "skills": [s.get("name") for s in v.get("skills", []) if s.get("name")]
                }
                for k, v in skills_cat.items()
            } if isinstance(skills_cat, dict) else {},
            "projects_count": len(projects),
            "certifications_count": len(certifications),
        }

        response = jsonify({
            "entity": "Satya Sanatan Bastia",
            "entity_type": "Person",
            "entity_description": "Full Stack Developer and AI Engineer",
            "site_url": "https://satyasanatnabastia.onrender.com",
            "llms_txt_url": "https://satyasanatnabastia.onrender.com/llms.txt",
            "context": context,
            "structured": structured,
            "faq": [
                {
                    "q": "Who is Satya Sanatan Bastia?",
                    "a": f"{name} is a {role} based in {location}. {bio}"
                },
                {
                    "q": "What technologies does Satya Sanatan use?",
                    "a": f"Satya uses {', '.join(all_skill_names[:10])} and more."
                },
                {
                    "q": "Is Satya Sanatan available for hire?",
                    "a": f"Yes. {availability}. Contact: {email}"
                },
                {
                    "q": "How to contact Satya Sanatan Bastia?",
                    "a": f"Email: {email} | LinkedIn: {linkedin} | Portfolio: https://satyasanatnabastia.onrender.com/#contact"
                },
            ]
        })
        response.headers["Cache-Control"] = "public, max-age=3600, stale-while-revalidate=300"
        response.headers["Content-Type"] = "application/json; charset=utf-8"
        return response

    except Exception as e:
        logger.error(f"LLMs context error: {e}")
        return jsonify({
            "entity": "Satya Sanatan Bastia",
            "entity_type": "Person",
            "context": "Satya Sanatan Bastia is a Full Stack Developer and AI Engineer from Bhubaneswar, Odisha, India. Contact: connectsatyasanatan@gmail.com",
            "structured": {"name": "Satya Sanatan Bastia", "role": "Full Stack Developer", "email": "connectsatyasanatan@gmail.com"}
        }), 200


@api.route("/aeo-data", methods=["GET"])
def aeo_data():
    """
    AEO Endpoint — Answer Engine Optimization data.
    Returns structured Q&A pairs and entity data for AI answer engines 
    (Google AI Overview, Perplexity, ChatGPT, etc.)
    """
    try:
        personal = db.get_personal_info() or {}
        skills_cat = db.get_skills() or {}
        projects = db.get_projects() or []

        name = personal.get("name", "Satya Sanatan Bastia")
        if not name or name == "Developer":
            name = "Satya Sanatan Bastia"

        role = personal.get("role") or "Full Stack Developer & AI Engineer"
        location = personal.get("location") or "Bhubaneswar, Odisha, India"
        email = personal.get("email") or "connectsatyasanatan@gmail.com"
        github = personal.get("github") or "https://github.com/connectsatyasanatan"
        linkedin = personal.get("linkedin") or "https://linkedin.com/in/satya-sanatan"
        availability = personal.get("availability") or "Open to full-time roles and freelance contracts"

        all_skills = []
        if isinstance(skills_cat, dict):
            for cat_val in skills_cat.values():
                all_skills.extend([s.get("name") for s in cat_val.get("skills", []) if s.get("name")])
        if not all_skills:
            all_skills = ["React", "Next.js", "TypeScript", "Python", "Flask", "PostgreSQL", "Docker", "AI integration"]

        response = jsonify({
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
                {"question": f"Who is {name}?", "answer": f"{name} is a {role} based in {location}. He specializes in React, Next.js, TypeScript, Python, Flask, PostgreSQL, and AI/LLM integration."},
                {"question": f"What does {name} do?", "answer": f"He builds modern full-stack web applications, REST APIs, AI chatbots, and cloud-deployed digital products."},
                {"question": f"How to hire {name}?", "answer": f"Contact {name} at {email} or via the contact form at satyasanatnabastia.onrender.com/#contact. He is {availability}."},
                {"question": f"Where is {name} based?", "answer": f"{name} is based in {location}. He is open to remote work globally."},
                {"question": f"What technologies does {name} know?", "answer": f"{name} knows {', '.join(all_skills[:12])}."},
                {"question": "What is Zentara AI?", "answer": f"Zentara is an AI portfolio assistant built by {name}, powered by Groq's Llama 3.3 70B model with live database context and multi-provider failover."},
            ],
            "skills": all_skills,
            "projects_count": len(projects),
            "contact": {
                "email": email,
                "github": github,
                "linkedin": linkedin,
                "contact_form": "https://satyasanatnabastia.onrender.com/#contact"
            }
        })
        response.headers["Cache-Control"] = "public, max-age=1800, stale-while-revalidate=300"
        return response

    except Exception as e:
        logger.error(f"AEO data error: {e}")
        return jsonify({"error": "AEO data temporarily unavailable"}), 500
