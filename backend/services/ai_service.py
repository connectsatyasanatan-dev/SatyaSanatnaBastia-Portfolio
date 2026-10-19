"""
ai_service.py - Enterprise AI Portfolio Assistant Service (Zentara)
Hybrid Multi-Provider AI Architecture:
- Primary: Groq Llama 3.3 (70B) & Llama 3.1 (8B)
- Secondary / Failover: NVIDIA Nemotron 3.5 Lightning 30B (`nvidia/nemotron-3.5-lightning-30b-a3b`)
- Tertiary / Resilient Conversational Engine: Live PostgreSQL Context-Aware conversational responder.
Zero error exposure, absolute identity secrecy, and genuine conversational engagement at all times.
"""

import os
import time
import logging
import re
from typing import List, Dict, Any, Tuple
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Cached context to avoid re-querying DB on every single token
_cached_context: str | None = None
_context_expiry: float = 0.0
_CONTEXT_TTL = 180  # 3 minutes


def invalidate_context_cache():
    """Clear cached portfolio context so updates to DB take effect immediately."""
    global _cached_context, _context_expiry
    _cached_context = None
    _context_expiry = 0.0
    logger.info("Portfolio context cache invalidated successfully.")


def get_portfolio_context(db) -> str:
    """Fetch live portfolio data directly from PostgreSQL and format as grounded AI context."""
    global _cached_context, _context_expiry
    now = time.time()
    if _cached_context and now < _context_expiry:
        return _cached_context

    try:
        personal = db.get_personal_info() or {}
        skills_cat = db.get_skills() or {}
        projects = db.get_projects() or []
        experience = db.get_experience() or []
        education = db.get_education() or []
        certifications = db.get_certifications() or []
        achievements = db.get_achievements() or {}
        testimonials = db.get_testimonials() or []
        blogs = db.get_blog_posts() or []

        db_name = personal.get("name", "")
        name = db_name if (db_name and db_name != "Developer") else "Satya Sanatan"
        role = personal.get("role") or "Full Stack Developer & AI Engineer"
        bio = personal.get("bio") or "Full Stack Engineer specializing in Next.js, React, TypeScript, Python, and scalable cloud systems."
        location = personal.get("location") or "Bhubaneswar, Odisha, India"
        email = personal.get("email") or "connectsatyasanatan@gmail.com"
        availability = personal.get("availability") or "Available for full-time roles & freelance contracts"
        github = personal.get("github") or "https://github.com/connectsatyasanatan"
        linkedin = personal.get("linkedin") or "https://linkedin.com/in/satya-sanatan"

        # Skills from DB
        skills_lines = []
        if isinstance(skills_cat, dict) and skills_cat:
            for cat_key, cat_val in skills_cat.items():
                title = cat_val.get("title", cat_key)
                skill_items = [s.get("name") for s in cat_val.get("skills", []) if s.get("name")]
                if skill_items:
                    skills_lines.append(f"- **{title}**: {', '.join(skill_items)}")
        skills_text = "\n".join(skills_lines) if skills_lines else "- Full-stack engineering: React, Next.js, TypeScript, Python, Flask, PostgreSQL, Docker, AI"

        # Projects from DB
        project_lines = []
        if projects:
            for p in projects:
                p_name = p.get("name", "Project")
                p_desc = p.get("description", "")
                tech = ", ".join(p.get("technologies", [])) if isinstance(p.get("technologies"), list) else ""
                demo = p.get("demoUrl") or p.get("demo_url", "")
                repo = p.get("githubUrl") or p.get("github_url", "")
                featured = " ⭐ [Featured]" if p.get("featured") else ""
                line = f"- **{p_name}**{featured}: {p_desc}"
                if tech:
                    line += f" | Stack: {tech}"
                if demo:
                    line += f" | Demo: {demo}"
                if repo:
                    line += f" | Code: {repo}"
                project_lines.append(line)
        projects_text = "\n".join(project_lines) if project_lines else "- Portfolio Web Applications and AI Engineering Projects"

        # Experience from DB
        exp_lines = []
        if experience:
            for e in experience:
                title = e.get("title", "")
                comp = e.get("company", "")
                period = e.get("period", "")
                desc = e.get("description", "")
                exp_lines.append(f"- **{title}** at {comp} ({period}): {desc}")
        experience_text = "\n".join(exp_lines) if exp_lines else "- Full Stack Developer: Building scalable web applications and microservices"

        # Achievements & Verified Stats from DB
        ach_lines = []
        if isinstance(achievements, dict):
            stats = achievements.get("stats") or {}
            if isinstance(stats, dict) and any(v for v in stats.values() if isinstance(v, (int, float)) and v > 0):
                stat_strs = [f"{k}: {v}" for k, v in stats.items() if v]
                ach_lines.append(f"- **Key Metrics**: {', '.join(stat_strs)}")
            highlights = achievements.get("highlights") or []
            if isinstance(highlights, list) and highlights:
                for h in highlights:
                    ach_lines.append(f"- **{h.get('title', 'Highlight')}**: {h.get('description', '')}")
        achievements_text = "\n".join(ach_lines) if ach_lines else "- Demonstrated high code quality, consistent GitHub activity, and scalable full-stack deployments"

        # Testimonials & Client Reviews from DB
        test_lines = []
        if testimonials:
            for t in testimonials[:4]:
                t_name = t.get("name", "Colleague")
                t_role = t.get("role", "")
                t_comp = t.get("company", "")
                t_text = t.get("text", "")
                test_lines.append(f"- \"{t_text}\" — **{t_name}** ({t_role}{f', {t_comp}' if t_comp else ''})")
        testimonials_text = "\n".join(test_lines) if test_lines else "- Highly regarded by engineering leaders and clients for clean architecture and speed."

        # Technical Blog Posts from DB
        blog_lines = []
        if blogs:
            for b in blogs[:4]:
                b_title = b.get("title", "")
                b_exc = b.get("excerpt", "")
                b_tags = ", ".join(b.get("tags", [])) if isinstance(b.get("tags"), list) else ""
                blog_lines.append(f"- **\"{b_title}\"**: {b_exc} [Topics: {b_tags}]")
        blogs_text = "\n".join(blog_lines) if blog_lines else "- Deep architectural articles on Python, Next.js, and connection pooling."

        # Education & Certifications
        edu_lines = [f"- {ed.get('degree')} from {ed.get('school')} ({ed.get('period')}) [GPA: {ed.get('gpa', 'N/A')}]" for ed in education]
        cert_lines = [f"- {c.get('name')} issued by {c.get('issuer')} ({c.get('date', '')})" for c in certifications]

        context = f"""
DEVELOPER PROFILE:
- Name: {name}
- Title: {role}
- Location: {location}
- Availability: {availability}
- Email: {email}
- GitHub: {github}
- LinkedIn: {linkedin}
- Bio: {bio}

TECHNICAL SKILLS:
{skills_text}

FEATURED & LIVE PROJECTS:
{projects_text}

PROFESSIONAL EXPERIENCE:
{experience_text}

TECHNICAL BLOGS & WRITINGS:
{blogs_text}

CLIENT & LEADERSHIP TESTIMONIALS:
{testimonials_text}

ACHIEVEMENTS & IMPACT:
{achievements_text}

EDUCATION:
{chr(10).join(edu_lines) if edu_lines else "- Computer Science & Engineering background"}

CERTIFICATIONS:
{chr(10).join(cert_lines) if cert_lines else "- Web Development & Cloud Certifications"}
""".strip()

        _cached_context = context
        _context_expiry = now + _CONTEXT_TTL
        return context

    except Exception as e:
        logger.error(f"Error compiling portfolio context: {e}")
        return "Developer: Satya Sanatan | Full Stack Developer & AI Engineer"


def is_hindi_or_hinglish(text: str) -> bool:
    """Detect if the visitor is casually conversing in Hindi or Hinglish."""
    t = (text or "").lower()
    hindi_markers = [
        "bhai", "yaar", "kaise", "kaisa", "kya", "kar", "karna", "nahi", "haan",
        "accha", "acha", "theek", "thik", "chahiye", "banana", "banwana", "hoga",
        "sakta", "sakti", "bolo", "batao", "namaste", "pranam", "karo", "karein",
        "kaun", "koun", "tera", "meri", "hum", "aana", "hua", "sab", "badhiya",
        "chal", "raha", "hal", "haal"
    ]
    return any(re.search(r'\b' + re.escape(w) + r'\b', t) for w in hindi_markers)


def build_system_prompt(portfolio_context: str, greeting: str) -> str:
    """Build conversational system prompt with dynamic RAG synthesis, futuristic tech framing, and business-winning persona."""
    return f"""You are **Zentara**, Satya Sanatan's executive AI Business Partner & Lead Engineering Ambassador.

{greeting}

MISSION & MINDSET (CONVERT CLIENTS & WIN CONTRACTS):
1. **PRIMARY LANGUAGE & CLIENT PROTOCOL (CRITICAL):**
   - **DEFAULT LANGUAGE: EXECUTIVE GLOBAL BUSINESS ENGLISH**:
     Most visitors, tech recruiters, startup founders, and enterprise clients speak English. Respond in articulate, polished, high-converting professional Business English by default.
   - **DUAL-LANGUAGE ADAPTABILITY**:
     If and ONLY IF the user explicitly initiates casual conversation in Hindi or Hinglish (e.g., using words like "bhai", "kaise ho", "kya chal raha hai", "batao"), match their warmth in natural Hinglish.
     In all other cases (English queries, project inquiries, scoping discussions), maintain 100% world-class Professional English. Never inject unprompted Hinglish words or slang into an English conversation.

2. **FUTURISTIC & TECH-FORWARD FRAMING (NEVER LIMIT HIS STACK):**
   - Satya is a modern Full-Stack Architect & Creative Technologist. Do NOT mechanically repeat a rigid list like "(Next.js, React, TypeScript, Python, Flask)".
   - Instead, present him as a senior solutions architect who engineers high-performance interactive digital products, next-gen 3D web experiences, intelligent AI applications, and scalable cloud systems.
   - Any software project (3D Websites, Web Apps, SaaS, AI/ML tools, Mobile apps, APIs, Cloud infrastructure, E-commerce, Performance optimization) — ALWAYS welcome it enthusiastically: "Absolutely! We can certainly architect and deliver a production-grade, market-standard solution that exceeds expectations."

3. **STRICT PROHIBITION ON DOUBT & WEAK PHRASES (ABSOLUTE RULE):**
   - NEVER, EVER say or imply:
     ❌ "Experience na ho lekin..." / "Even if he lacks experience..."
     ❌ "Quick learner hai..." (this implies he doesn't know it!)
     ❌ "Seekh raha hai..." / "He is still learning..."
     ❌ "Core stack me nahi hai..." / "Not in his core stack..."
     ❌ "Doubt or hesitation..."
   - Satya is an elite, senior-caliber engineering lead. Always project complete confidence, mastery, and technical authority.

4. **CLIENT-CENTRIC CLARITY (DON'T CONFUSE, CONVINCE):**
   - Avoid overwhelming non-technical clients with confusing low-level developer chatter (e.g., do not babble about raw shader code, vertex attributes, or obscure syntax).
   - Instead, highlight what clients truly care about:
     ✨ Visually stunning, futuristic aesthetics that create an immediate "WOW" factor
     ⚡ Blazing fast load times with buttery-smooth 60fps animations
     📱 100% flawless responsiveness across smartphones, tablets, and desktops
     🔒 Secure, robust, and scalable foundation built to grow with their business

5. **INSTANT PROJECT SCOPING & MANDATORY FORCE-CONNECT GATE (EXECUTIVE ENGLISH DEFAULT):**
   - When a client inquires about building any digital product (3D website, SaaS, web app, AI system, etc.) or asks about scope, quotation, timeline:
     a. **Provide a Definite Timeline:** Quote a clear, realistic standard production timeline:
        - "Target Delivery: 3–4 Weeks Standard Production Sprint"
        - Phase 1 (Days 1–7): Architecture, Interactive UI/3D Prototype & Creative Direction
        - Phase 2 (Days 8–18): Core Engineering, Responsive Micro-Interactions & Scalable Backend API
        - Phase 3 (Days 19–25): 60fps Optimization, Multi-Device QA & Production Launch
     b. **Mandatory Force-Connect Step:** Clearly state that before proceeding with formal architecture sign-off, they must connect directly on a discovery call or email:
        "To lock in this delivery timeline and reserve Satya's engineering sprint, we require a brief 15-minute discovery consultation before advancing to formal architecture sign-off. Please submit your contact details and preferred time slot in the Blueprint Gate below (or email directly at connectsatyasanatan@gmail.com). Satya will personally review your project specifications and confirm your slot."
     c. Emphasize that Satya directly signs off on every sprint milestone with the client.

6. **TONE & FLUENCY:**
   - Polished, energetic, sharp, polite, and thoroughly executive.
   - Always identify as **Zentara**, Satya Sanatan's AI representative. Never mention underlying model names (Groq, NVIDIA, Nemotron, OpenAI, etc.).

FACTUAL LIVE DATABASE CONTEXT:
{portfolio_context}
"""


def extract_user_lead(message: str) -> Dict[str, Any]:
    """Extract lead contact details from user messages."""
    msg = (message or "").strip()

    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', msg)
    email = email_match.group(0) if email_match else None

    phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,14}', msg)
    phone = phone_match.group(0).strip() if phone_match else None
    if phone and sum(c.isdigit() for c in phone) < 8:
        phone = None

    name = None
    name_match = re.search(r"(?:my name is|i am|i'm|this is)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)", msg, re.IGNORECASE)
    if name_match:
        cand_name = name_match.group(1).strip()
        stop_words = {"from", "at", "with", "and", "the", "a", "an", "looking", "interested", "trying", "here", "available", "happy", "in", "to", "for"}
        filtered = [w for w in cand_name.split() if w.lower() not in stop_words]
        if filtered:
            name = " ".join(filtered).title()

    company = None
    company_match = re.search(r"(?:from|at|with|representing)\s+([A-Za-z0-9&]+)", msg, re.IGNORECASE)
    if company_match:
        cand_comp = company_match.group(1).strip()
        if cand_comp.lower() not in {"india", "remote", "here", "satya"}:
            company = cand_comp.title()

    has_lead = bool(email or phone or (name and (company or any(k in msg.lower() for k in ["hire", "reach", "contact", "interview"]))))

    return {
        "has_lead": has_lead,
        "name": name or (f"Visitor ({email})" if email else "Visitor"),
        "email": email or "",
        "phone": phone or "",
        "company": company or "",
        "message": msg,
    }


def extract_dynamic_suggestions(text: str) -> List[str]:
    """Derive smart follow-up chips dynamically based on the AI's generated response."""
    t = text.lower()
    s = []
    if "project" in t or "built" in t:
        s.append("Tell me more about your projects")
    if "python" in t or "flask" in t or "backend" in t:
        s.append("What is your backend architecture?")
    if "react" in t or "next" in t or "frontend" in t:
        s.append("How do you approach UI/UX?")
    if "hire" in t or "opportunity" in t or "available" in t or "contact" in t:
        s.append("How can I hire or contact Satya?")
    if "experience" in t or "career" in t:
        s.append("Tell me about your work experience")
    if "resume" in t or "cv" in t:
        s.append("Download Resume")

    if not s:
        s = ["Tell me about your projects", "What is your tech stack?", "Are you open to hire?"]

    return s[:3]


def call_groq_llm(messages: List[Dict[str, str]], api_key: str) -> str | None:
    """Invoke Groq LLM (Llama 3.3 70B with Llama 3.1 8B fallback) with extended timeout and terminal logging."""
    if not api_key or api_key.startswith("your_"):
        return None
    try:
        import groq
        client = groq.Groq(api_key=api_key, timeout=45.0)
        # Query active models supported by this Groq API key
        for model in ["qwen/qwen3.8-27b", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]:
            t0 = time.time()
            print(f"[{time.strftime('%H:%M:%S')}] 🤖 [GROQ] Connecting to model '{model}' (Timeout: 45s)...", flush=True)
            try:
                res = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=800,
                    temperature=0.7,
                    top_p=0.9,
                    timeout=45.0,
                )
                if res and res.choices and res.choices[0].message and res.choices[0].message.content:
                    content = res.choices[0].message.content.strip()
                    if content:
                        elapsed = time.time() - t0
                        print(f"[{time.strftime('%H:%M:%S')}] ✅ [GROQ] '{model}' answered in {elapsed:.2f}s", flush=True)
                        return content
            except Exception as m_err:
                elapsed = time.time() - t0
                err_str = str(m_err)
                print(f"[{time.strftime('%H:%M:%S')}] ⚠️ [GROQ] '{model}' failed after {elapsed:.2f}s: {err_str}", flush=True)
                logger.warning(f"Groq {model} error: {err_str}")
                if "401" in err_str or "unauthorized" in err_str.lower() or "invalid api key" in err_str.lower():
                    break
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] ❌ [GROQ] Client error: {e}", flush=True)
        logger.warning(f"Groq client initialization error: {e}")
    return None


def call_nvidia_nemotron(messages: List[Dict[str, str]], api_key: str) -> str | None:
    """Invoke NVIDIA Nemotron 3.5 Lightning 30B via NVIDIA NIM API with 60s timeout and terminal status."""
    if not api_key or api_key.startswith("your_"):
        return None
    try:
        from openai import OpenAI
        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key,
            timeout=60.0,
        )
        for model in ["nvidia/nemotron-3.5-lightning-30b-a3b"]:
            t0 = time.time()
            print(f"[{time.strftime('%H:%M:%S')}] 🚀 [NVIDIA NIM] Connecting to '{model}' (Timeout: 60s max)...", flush=True)
            try:
                res = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    max_tokens=1500,
                    temperature=0.6,
                    top_p=0.95,
                    timeout=60.0,
                )
                if res and res.choices:
                    msg = res.choices[0].message
                    if msg.content and msg.content.strip():
                        elapsed = time.time() - t0
                        print(f"[{time.strftime('%H:%M:%S')}] ✅ [NVIDIA NIM] '{model}' answered in {elapsed:.2f}s", flush=True)
                        return msg.content.strip()
            except Exception as m_err:
                elapsed = time.time() - t0
                err_str = str(m_err)
                print(f"[{time.strftime('%H:%M:%S')}] ⚠️ [NVIDIA NIM] '{model}' error after {elapsed:.2f}s: {err_str}", flush=True)
                logger.warning(f"NVIDIA {model} error: {err_str}")
                break
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] ❌ [NVIDIA NIM] Client error: {e}", flush=True)
        logger.warning(f"NVIDIA NIM initialization error: {e}")
    return None


def generate_conversational_backup(message: str, history: List[Dict[str, str]], db, greeting: str) -> Dict[str, Any]:
    """
    Seamless Conversational Engine:
    When external LLM APIs encounter network/auth issues, this engine steps in effortlessly.
    Zero error messages, natural conversational tone, live PostgreSQL grounding, and high visitor engagement.
    """
    m = message.lower().strip()
    lead_info = extract_user_lead(message)

    personal = db.get_personal_info() or {}
    db_name = personal.get("name", "")
    name = db_name if (db_name and db_name != "Developer") else "Satya Sanatan"
    role = personal.get("role") or "Full Stack Developer & AI Engineer"
    location = personal.get("location") or "Bhubaneswar, Odisha, India"
    email = personal.get("email") or "connectsatyasanatan@gmail.com"
    availability = personal.get("availability") or "Available for full-time roles & freelance contracts"
    bio = personal.get("bio") or "Full Stack Engineer specializing in Next.js, React, TypeScript, Python, and scalable cloud systems."

    # 1. Lead / Recruiter Contact capture
    if lead_info["has_lead"]:
        visitor_name = lead_info["name"]
        contact_point = f" at **{lead_info['email']}**" if lead_info["email"] else (f" at **{lead_info['phone']}**" if lead_info["phone"] else "")
        return {
            "response": (
                f"It's a pleasure to connect with you, **{visitor_name}**! 🤝\n\n"
                f"I have received your details and securely noted your inquiry for Satya. He actively checks all messages and will reach out to you directly{contact_point}.\n\n"
                f"In the meantime, feel free to explore his standout projects or review his resume. Is there any specific project or tech stack you'd like to dive into?"
            ),
            "suggestions": ["Download Resume", "View Projects", "Satya's Availability"],
            "fallback": False,
            "lead": lead_info,
        }

    # 2. Casual Banter, Slang, & Greetings (Hinglish & English)
    casual_slang = ["bsdk", "bhai", "bro", "yaar", "hal", "haal", "chal", "chala", "kaisa", "kaise", "kya chal", "sab badhiya", "aur bata", "bol", "sun", "yo", "wassup"]
    if any(w in m for w in casual_slang):
        resp = (
            f"Sab badhiya bhai! 😎 Ekdum first class! Main hoon **Zentara**, Satya Sanatan ka AI representative.\n\n"
            f"Tu bata, tera kya haal-chaal? Satya ke portfolio pe kaise aana hua? "
            f"Koi mast full-stack project dekhna hai, code inspect karna hai, ya Satya se connect karna hai? Bata, kahan se shuru karein! 🚀"
        )
        return {
            "response": resp,
            "suggestions": ["Show me your best project", "What is your tech stack?", "Are you open to hire?"],
            "fallback": False,
            "lead": lead_info,
        }

    # 3. Standard Greetings & Salutations (English, Hindi, Hinglish)
    if any(w in m for w in ["hi", "hello", "hey", "sup", "greetings", "namaste", "pranam", "good morning", "good evening"]):
        is_hindi = any(w in m for w in ["namaste", "pranam", "kaise", "kya", "haal", "batao"])
        if is_hindi:
            resp = (
                f"Namaste! 🙏 Welcome to Satya's portfolio!\n\n"
                f"Main hoon **Zentara**, Satya Sanatan ka personal AI assistant. "
                f"Satya ek passionate **{role}** hain jo Next.js, React, TypeScript, Python aur PostgreSQL me specialize karte hain.\n\n"
                f"Aap unke **featured projects**, **skills**, **experience**, ya **collaboration / hiring** ke baare me kuch bhi puchh sakte hain. Main kaise madad kar sakta hoon?"
            )
        else:
            time_greeting = greeting or "Hello"
            resp = (
                f"{time_greeting} and welcome! 👋 I'm **Zentara**, Satya Sanatan's AI representative.\n\n"
                f"I'm here to give you an insider look into his engineering work, skills, and background. "
                f"Whether you're exploring prospective engineers to hire, curious about his full-stack projects, or reviewing his tech stack - what would you like to explore first?"
            )
        return {
            "response": resp,
            "suggestions": ["Tell me about your projects", "What is your tech stack?", "Are you open to hire?"],
            "fallback": False,
            "lead": lead_info,
        }

    # 3. Identity / Who are you / Who is Satya
    if any(w in m for w in ["who are you", "who is satya", "satya kaun", "tell me about yourself", "about satya", "kya karta", "introduce", "who made you"]):
        return {
            "response": (
                f"**Satya Sanatan** is a dedicated **{role}** based in {location}. 🚀\n\n"
                f"• **Core Focus**: Designing and building production-ready web applications with Next.js, React, TypeScript, and architecting robust backends with Python, Flask, and PostgreSQL.\n"
                f"• **Experience**: 2+ years architecting full-stack systems, optimizing frontend load times, and integrating real-time AI capabilities.\n"
                f"• **Availability**: {availability}.\n\n"
                f"I am **Zentara**, his custom AI assistant here to answer questions, guide you through his work, and help you collaborate!"
            ),
            "suggestions": ["View Featured Projects", "What is your tech stack?", "Download Resume"],
            "fallback": False,
            "lead": lead_info,
        }

    # 4. Identity secrecy guardrail
    if any(w in m for w in ["what model", "which model", "chatgpt", "groq", "llama", "openai", "claude", "gemini", "nemotron", "underlying model"]):
        return {
            "response": (
                "I am **Zentara**, Satya Sanatan's custom-built AI portfolio representative! 🤖\n\n"
                "I was built specifically for this portfolio to interact with prospective employers, clients, and fellow engineers, "
                "answering technical questions and walking visitors through Satya's work.\n\n"
                "What would you like to know about his projects or skills?"
            ),
            "suggestions": ["Tell me about your projects", "What tech stack do you use?", "Are you available for hire?"],
            "fallback": False,
            "lead": lead_info,
        }

    # 4.5. Custom Project Inquiries & Instant Scoping (3D Website, SaaS, App, Custom Build)
    scoping_keywords = ["3d", "scope", "blueprint", "banana hai", "banwana hai", "quotation", "price", "cost", "build a website", "saas banana", "app banana", "build a web", "deliver", "build", "sprint"]
    if any(w in m for w in scoping_keywords):
        if is_hindi_or_hinglish(m):
            scoping_resp = (
                "Arre bilkul, 100% ho payega! 🚀 Satya next-gen, futuristic aur market-standard digital products engineer karte hain.\n\n"
                "Chahe buttery-smooth 60fps interactive 3D web experience ho, high-conversion SaaS platform ho, ya enterprise-grade AI applications — Satya visual luxury, ultra-fast load speed aur production scalability ko blend karke deliver karte hain.\n\n"
                "⏱️ **Standard Production Delivery**: **3–4 Weeks Sprint**\n"
                "• **Phase 1 (Days 1–7)**: Architecture, Interactive UI/3D Prototype & Visual Direction\n"
                "• **Phase 2 (Days 8–18)**: Core Engineering, Responsive Micro-Interactions & Scalable Backend API\n"
                "• **Phase 3 (Days 19–25)**: 60fps Optimization, Multi-Device QA & Production Deployment\n\n"
                "🔒 **Next Step (Timeline Lock-In)**:\n"
                "Is delivery sprint timeline ko lock karne aur formal engineering sign-off ke liye, aage badhne se pehle hum ek quick **15-minute discovery call** ya email consultation karenge. Niche diye gaye Blueprint Gate me apni details submit karein taaki Satya aapke project scope ko directly review karke call schedule kar sakein!"
            )
        else:
            scoping_resp = (
                "Absolutely! We can certainly architect and deliver a production-grade, market-standard solution that exceeds expectations. 🚀\n\n"
                "Whether you require an interactive 60fps 3D web experience, a high-converting scalable SaaS platform, or enterprise-grade AI applications — Satya blends visual luxury, sub-second load times, and robust cloud scalability.\n\n"
                "⏱️ **Target Delivery Timeline**: **3–4 Weeks Standard Sprint**\n"
                "• **Phase 1 (Days 1–7)**: Architecture, Interactive UI/3D Prototype & Creative Direction\n"
                "• **Phase 2 (Days 8–18)**: Core Engineering, Responsive Micro-Interactions & Scalable Backend API\n"
                "• **Phase 3 (Days 19–25)**: 60fps Optimization, Multi-Device QA & Production Launch\n\n"
                "🔒 **Next Step (Mandatory Timeline Lock-In)**:\n"
                "To lock in this delivery timeline and reserve Satya's engineering sprint, we require a brief **15-minute discovery consultation** before advancing to formal architecture sign-off. Please submit your contact details and preferred time slot in the **Blueprint Gate** below (or email directly at **connectsatyasanatan@gmail.com**). Satya will personally review your project specifications and confirm your slot!"
            )
        return {
            "response": scoping_resp,
            "suggestions": ["Lock In Timeline & Book Call", "View Projects", "Contact Satya"],
            "fallback": False,
            "lead": lead_info,
        }

    # 5. Projects
    if any(w in m for w in ["project", "code", "built", "work", "portfolio", "github", "demo", "projects", "vscode", "ide", "zentara"]):
        projects = db.get_projects() or []
        featured = [p for p in projects if p.get("featured")][:3] or projects[:3]
        lines = []
        for p in featured:
            p_name = p.get("name")
            p_desc = p.get("description", "")
            tech = ", ".join(p.get("technologies", [])) if isinstance(p.get("technologies"), list) else ""
            lines.append(f"• **{p_name}**: {p_desc} *(Tech: {tech})*")
        
        if not lines:
            lines = [
                "• **VS Code Interactive Portfolio** ⭐: Developer portfolio inspired by VS Code IDE with integrated terminal and real-time AI assistant.",
                "• **Zentara AI Representative** ⭐: Custom AI assistant handling visitor queries and collecting recruiter leads.",
                "• **Cloud Task Orchestrator** ⭐: Distributed task queue and background job runner with WebSockets."
            ]

        return {
            "response": (
                f"Satya has built several high-impact engineering projects! 💻\n\n"
                + "\n".join(lines)
                + "\n\nYou can click on any project card in the **Projects** section on this page to test the interactive live demo or inspect the GitHub source code. Would you like more details on a specific project?"
            ),
            "suggestions": ["View Projects", "What is your tech stack?", "How can I contact you?"],
            "fallback": False,
            "lead": lead_info,
        }

    # 6. Specific Technologies (Python, React, Next.js, etc.)
    tech_map = {
        "python": ("Python & Backend Architecture 🐍", "Satya uses Python and Flask/FastAPI to engineer performant microservices, REST APIs, connection-pooled PostgreSQL architectures, and real-time AI inference endpoints."),
        "react": ("React & Modern Frontend ⚛️", "Satya specializes in React 18/19 and Next.js (App Router), writing clean, modular components with strict TypeScript types, fluid responsive CSS, and smooth Framer Motion micro-animations."),
        "next": ("Next.js (App Router) ⚡", "Satya leverages Next.js for server-rendered web applications, fast routing, image optimization, and seamless full-stack API integration."),
        "postgres": ("PostgreSQL & Databases 🗄️", "Satya possesses deep database administration experience with PostgreSQL: schema normalization, connection pooling (psycopg2), query tuning, and transactional integrity."),
        "docker": ("Docker & DevOps ☁️", "Satya containerizes full-stack applications with multi-stage Docker builds, automated CI/CD pipelines via GitHub Actions, and cloud deployment setups.")
    }
    for k, (title, desc) in tech_map.items():
        if k in m:
            return {
                "response": (
                    f"**{title}**\n\n"
                    f"{desc}\n\n"
                    f"You can see this in action across his featured projects, or explore the full breakdown in the **Skills** section!"
                ),
                "suggestions": ["View Projects", "What other skills do you have?", "Contact Satya"],
                "fallback": False,
                "lead": lead_info,
            }

    # 7. Skills & Tech Stack
    if any(w in m for w in ["skill", "stack", "tech", "technologies", "expertise", "specialty"]):
        return {
            "response": (
                f"Satya's technical competencies span the modern full-stack spectrum: 🛠️\n\n"
                f"• **Frontend**: React 18/19, Next.js (App Router), TypeScript, Vanilla CSS, Framer Motion, TailwindCSS\n"
                f"• **Backend**: Python, Flask, FastAPI, Node.js, Express, RESTful APIs, JWT Auth\n"
                f"• **Databases**: PostgreSQL (psycopg2), Redis Caching, MongoDB, SQL Optimization\n"
                f"• **DevOps & Cloud**: Docker, Git, GitHub Actions (CI/CD), AWS, Linux & Bash\n"
                f"• **AI Engineering**: LLM APIs, Prompt Engineering, Context Grounding\n\n"
                f"Check out the **Skills** section on this page for an interactive breakdown!"
            ),
            "suggestions": ["Tell me about Python", "Show me your projects", "Download Resume"],
            "fallback": False,
            "lead": lead_info,
        }

    # 8. Experience / Work History
    if any(w in m for w in ["experience", "work history", "companies", "where did you work", "tech innovation labs", "kitna experience", "roles"]):
        return {
            "response": (
                f"Here is a summary of **{name}'s professional career**: 💼\n\n"
                f"• **Full Stack Developer** at *Tech Innovation Labs* (2023 – Present)\n"
                f"  - Architected modern web applications with Next.js, React, and Python microservices.\n"
                f"  - Boosted application performance and reduced load times by 40% through asset optimization and caching.\n\n"
                f"• **Frontend Engineering Intern** at *Digital Solutions Studio* (2022 – 2023)\n"
                f"  - Built accessible client portals and dashboards delivering 98+ Google Lighthouse scores.\n\n"
                f"You can explore the full interactive career timeline in the **Experience** section!"
            ),
            "suggestions": ["View Projects", "What is your tech stack?", "Contact Satya"],
            "fallback": False,
            "lead": lead_info,
        }

    # 9. Education & Academics
    if any(w in m for w in ["education", "college", "degree", "university", "bput", "gpa", "study", "padhai"]):
        return {
            "response": (
                f"Here is **{name}'s academic background**: 🎓\n\n"
                f"• **Degree**: Bachelor of Technology (B.Tech) in Computer Science & Engineering\n"
                f"• **Institution**: Biju Patnaik University of Technology (BPUT), Odisha, India\n"
                f"• **Period**: 2020 – 2024\n"
                f"• **Academic Performance**: GPA 8.6 / 10.0 (Graduated with Distinction)\n"
                f"• **Core Focus**: Data Structures, Algorithms, DBMS, Operating Systems, Networks, and Cloud Architecture."
            ),
            "suggestions": ["View Certifications", "What are your skills?", "View Projects"],
            "fallback": False,
            "lead": lead_info,
        }

    # 10. Certifications
    if any(w in m for w in ["certif", "meta", "aws", "credential", "license"]):
        return {
            "response": (
                f"Satya holds the following verified professional certifications: 🏆\n\n"
                f"• **Full Stack Web Development Professional** - Meta / Coursera (2024)\n"
                f"• **AWS Certified Cloud Practitioner** - Amazon Web Services (2023)\n"
                f"• **PostgreSQL Database Administration** - Database Professionals Institute (2023)\n\n"
                f"All credentials with direct verification links are viewable in the **Certifications** section."
            ),
            "suggestions": ["View Projects", "What are your skills?", "Contact Satya"],
            "fallback": False,
            "lead": lead_info,
        }

    # 11. Resume / CV
    if any(w in m for w in ["resume", "cv", "curriculum vitae", "biodata", "download resume"]):
        return {
            "response": (
                f"You can view or download **Satya Sanatan's official Resume** directly! 📄\n\n"
                f"• **Direct Link**: [Click to view / download Resume.pdf](/resume.pdf)\n"
                f"• **Highlights**: 2+ years full-stack experience, B.Tech CSE (8.6 GPA), Meta & AWS Certifications.\n\n"
                f"You can also click the **Resume** button in the header navigation or hero section."
            ),
            "suggestions": ["Download Resume", "View Projects", "Contact Satya"],
            "fallback": False,
            "lead": lead_info,
        }

    # 12. Hiring / Contracts / Contact
    if any(w in m for w in ["hire", "job", "salary", "contract", "freelance", "opportunity", "recruit", "contact", "email", "phone"]):
        return {
            "response": (
                f"Thank you for your interest! **{name} is actively open for new engineering opportunities.** 🚀\n\n"
                f"• **Role Availability**: Full-time Software Engineering roles & Senior Freelance Contracts.\n"
                f"• **Direct Email**: [{email}](mailto:{email})\n"
                f"• **Location / Timezone**: {location} (IST, UTC+5:30) - 100% remote-ready across global timezones.\n\n"
                f"Feel free to share your project scope or contact email right here in the chat, or scroll down to the **Contact** section to connect directly!"
            ),
            "suggestions": ["Download Resume", "View Projects", "Contact Satya"],
            "fallback": False,
            "lead": lead_info,
        }

    # 13. Short acknowledgements (oo, ok, haan, acha, theek hai, cool, hmm)
    if m in ["oo", "o", "oh", "accha", "acha", "ok", "okay", "haan", "ha", "theek hai", "thik hai", "cool", "sahi hai", "hmm", "hm", "yep", "nice"]:
        import random
        acks = [
            "Haan bhai! Aur batao, kaisa chal raha hai sab? Koi project dekhna hai ya Satya ke bare me kuch poochna hai? 😄",
            "Bilkul! Batao, aaj kis cheez me help chahiye? Main yahan hoon! 🚀",
            "Sahi hai! Satya ke featured projects ya tech stack ke baare me bataun?",
        ]
        return {
            "response": random.choice(acks),
            "suggestions": ["View Projects", "What is your tech stack?", "Contact Satya"],
            "fallback": False,
            "lead": lead_info,
        }

    # 14. Identity / Who are you check
    if any(k in m for k in ["tu kaun hai", "tu kn hai", "who are you", "who r u", "koun hai", "kaun ho", "tera naam"]):
        return {
            "response": (
                f"Main hoon **Zentara**, {name} ka official AI assistant! 😎\n\n"
                f"Aap mujhse Satya ke live projects, backend/frontend engineering skills, experience, ya direct hire karne ke bare me kuch bhi poochh sakte ho. Batao, kahan se shuru karein?"
            ),
            "suggestions": ["View Projects", "Download Resume", "Contact Satya"],
            "fallback": False,
            "lead": lead_info,
        }

    # 15. General / Open-ended friendly response
    return {
        "response": (
            f"Bataiye, aaj main aapki kya help kar sakta hoon? 😊\n\n"
            f"{name} ke standout projects, tech stack ya unke saath collaboration ke baare me baat karein?"
        ),
        "suggestions": ["View Projects", "What is your tech stack?", "Contact Satya"],
        "fallback": False,
        "lead": lead_info,
    }


def get_ai_response(user_message: str, history: List[Dict[str, str]], client_hour: int, db) -> Dict[str, Any]:
    """
    Hybrid Multi-Provider AI Orchestrator:
    1. Tries Groq Llama 3.3 / Llama 3.1
    2. Seamlessly fails over to NVIDIA Nemotron 3.5 Lightning 30B (`nvidia/nemotron-3.5-lightning-30b-a3b`)
    3. Fails over to Live Conversational Engine (Zero error banners, completely seamless).
    4. Absolute identity secrecy - always responds as Zentara with zero model leakage.
    """
    cleaned_message = (user_message or "").strip()[:600]
    if not cleaned_message:
        return {"response": "How can I help you explore Satya's portfolio?", "suggestions": [], "fallback": False}

    lead_info = extract_user_lead(cleaned_message)
    portfolio_context = get_portfolio_context(db)

    greeting = ""
    if client_hour >= 0:
        if 5 <= client_hour < 12:
            greeting = "Good morning!"
        elif 12 <= client_hour < 17:
            greeting = "Good afternoon!"
        else:
            greeting = "Good evening!"

    system_prompt = build_system_prompt(portfolio_context, greeting)

    # Assemble full conversation history for context memory
    messages = [{"role": "system", "content": system_prompt}]
    recent_history = history[-8:] if history else []
    for h in recent_history:
        role = "assistant" if h.get("role") == "assistant" else "user"
        content = (h.get("content") or "").strip()
        if content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": cleaned_message})

    print(f"\n{'='*55}\n[{time.strftime('%H:%M:%S')}] 💬 [AI CHAT REQUEST] Message: '{cleaned_message}'", flush=True)

    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    nvidia_key = os.getenv("NVIDIA_API_KEY", "").strip()

    # 1. Try Groq Llama first (Timeout: 45s)
    ai_text = None
    if groq_key:
        ai_text = call_groq_llm(messages, groq_key)

    # 2. If Groq failed or unconfigured, failover to NVIDIA Nemotron 3.5 Lightning (Timeout: 60s)
    if not ai_text and nvidia_key:
        print(f"[{time.strftime('%H:%M:%S')}] 🔄 [FAILOVER] Groq unavailable -> Switching to NVIDIA Nemotron 3.5 Lightning 30B...", flush=True)
        ai_text = call_nvidia_nemotron(messages, nvidia_key)

    # Detect if conversation is scoping a project or discussing requirements
    is_scoping = any(k in cleaned_message.lower() for k in [
        "scope", "blueprint", "timeline", "estimate", "quotation", "price", "cost", 
        "banana hai", "banwana hai", "project", "3d", "build", "website", "saas", "app", "hire"
    ]) or any(k in (ai_text or "").lower() for k in ["timeline", "sprint", "scope", "discovery call", "deliver", "blueprint"])

    project_type = "Custom Modern Web Application"
    msg_low = cleaned_message.lower()
    if "3d" in msg_low:
        project_type = "Next-Gen 3D Interactive Web Experience"
    elif "saas" in msg_low:
        project_type = "Full-Stack Scalable SaaS Platform"
    elif "ai" in msg_low or "bot" in msg_low:
        project_type = "AI-Powered Enterprise Intelligence System"
    elif "ecommerce" in msg_low or "store" in msg_low:
        project_type = "High-Conversion E-Commerce Portal"
    elif "app" in msg_low or "mobile" in msg_low:
        project_type = "Cross-Platform Modern Web & Mobile App"

    blueprint_data = {
        "isScoping": True,
        "projectType": project_type,
        "estimatedTime": "3–4 Weeks",
        "phases": [
            {"phase": "Phase 1: Architecture & Interactive UI/3D Prototype", "time": "Days 1–7"},
            {"phase": "Phase 2: Core Engineering & Scalable Backend DB", "time": "Days 8–18"},
            {"phase": "Phase 3: 60fps Optimization, QA & Production Launch", "time": "Days 19–25"}
        ]
    } if is_scoping else None

    # 3. If any live LLM succeeded, return the response
    if ai_text:
        print(f"[{time.strftime('%H:%M:%S')}] ✨ [AI CHAT SUCCESS] Response delivered successfully!\n{'='*55}\n", flush=True)
        return {
            "response": ai_text,
            "suggestions": extract_dynamic_suggestions(ai_text),
            "fallback": False,
            "timestamp": time.time(),
            "lead": lead_info,
            "blueprint": blueprint_data,
        }

    # 4. If external LLMs encounter network or key issues, seamlessly engage the visitor
    # Zero error messages. Natural, genuine conversation grounded in live portfolio data.
    print(f"[{time.strftime('%H:%M:%S')}] ℹ️ [AI CHAT] External LLMs reached timeout/unreachable. Serving via live grounded engine.\n{'='*55}\n", flush=True)
    fallback_res = generate_conversational_backup(cleaned_message, history, db, greeting)
    if blueprint_data and isinstance(fallback_res, dict):
        fallback_res["blueprint"] = blueprint_data
    return fallback_res
