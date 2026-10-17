"""
database.py — PostgreSQL only, using psycopg2
Set DATABASE_URL env var: postgresql://user:password@host:5432/dbname
"""

import json
import os
import psycopg2
import psycopg2.extras
from typing import Dict, List, Any
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    db_url = os.environ.get("DATABASE_URL", "")
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    if not db_url:
        raise RuntimeError("DATABASE_URL environment variable is not set.")
    conn = psycopg2.connect(db_url)
    return conn


def _cursor(conn):
    """Return a RealDictCursor so rows behave like dicts."""
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def init_database():
    """Create all tables if they don't exist."""
    conn = get_connection()
    cur = _cursor(conn)

    cur.execute(
        """CREATE TABLE IF NOT EXISTS personal_info (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL, role TEXT, title TEXT, location TEXT,
        status TEXT, experience TEXT, email TEXT, phone TEXT,
        github TEXT, linkedin TEXT, twitter TEXT, portfolio TEXT,
        resume TEXT, bio TEXT, availability TEXT, timezone TEXT,
        languages TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    cur.execute(
        """CREATE TABLE IF NOT EXISTS skills (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        skills_data TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    cur.execute(
        """CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL, filename TEXT, version TEXT, downloads TEXT,
        description TEXT, technologies TEXT, features TEXT,
        stars INTEGER DEFAULT 0, forks INTEGER DEFAULT 0,
        demo_url TEXT, github_url TEXT,
        status TEXT DEFAULT 'active', featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    cur.execute(
        """CREATE TABLE IF NOT EXISTS experience (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL, company TEXT NOT NULL,
        location TEXT, period TEXT, duration TEXT, type TEXT,
        description TEXT, achievements TEXT, technologies TEXT,
        commit_hash TEXT, color TEXT, badge TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    cur.execute(
        """CREATE TABLE IF NOT EXISTS education (
        id SERIAL PRIMARY KEY,
        degree TEXT NOT NULL, school TEXT NOT NULL,
        location TEXT, period TEXT, gpa TEXT,
        relevant_courses TEXT, achievements TEXT,
        focus TEXT, certification TEXT, duration TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    cur.execute(
        """CREATE TABLE IF NOT EXISTS certifications (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL, issuer TEXT NOT NULL,
        date TEXT, credential TEXT, validity TEXT, badge TEXT, verify_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    cur.execute(
        """CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL UNIQUE,
        data TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    cur.execute(
        """CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL, role TEXT NOT NULL, company TEXT NOT NULL,
        text TEXT NOT NULL, rating INTEGER DEFAULT 5, date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    cur.execute(
        """CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL, excerpt TEXT, date TEXT, read_time TEXT,
        tags TEXT, featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    cur.execute(
        """CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL, email TEXT NOT NULL,
        subject TEXT, message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    cur.execute(
        """CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        visitor_id TEXT NOT NULL, session_id TEXT NOT NULL,
        ip_address TEXT, device_type TEXT, browser TEXT,
        referrer TEXT, page_path TEXT DEFAULT '/',
        location_country TEXT, location_city TEXT,
        duration INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"""
    )

    cur.execute(
        """CREATE TABLE IF NOT EXISTS revoked_tokens (
        jti VARCHAR(64) PRIMARY KEY,
        token_type VARCHAR(16) NOT NULL,
        username TEXT NOT NULL,
        revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
    )"""
    )
    cur.execute(
        """CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON revoked_tokens(expires_at)"""
    )

    conn.commit()
    cur.close()
    conn.close()


def _init_default_data():
    """Seed tables with default data if empty."""
    from .portfolio_data import (
        PERSONAL_INFO,
        SKILLS,
        PROJECTS,
        EXPERIENCE,
        TESTIMONIALS,
        BLOG_POSTS,
        ACHIEVEMENTS,
    )

    conn = get_connection()
    cur = _cursor(conn)

    cur.execute("SELECT COUNT(*) FROM personal_info")
    if cur.fetchone()["count"] == 0:
        cur.execute(
            """INSERT INTO personal_info (name,role,title,location,status,experience,
               email,phone,github,linkedin,twitter,portfolio,resume,bio,availability,timezone,languages)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (
                PERSONAL_INFO.get("name"),
                PERSONAL_INFO.get("role"),
                PERSONAL_INFO.get("title"),
                PERSONAL_INFO.get("location"),
                PERSONAL_INFO.get("status"),
                PERSONAL_INFO.get("experience"),
                PERSONAL_INFO.get("email"),
                PERSONAL_INFO.get("phone"),
                PERSONAL_INFO.get("github"),
                PERSONAL_INFO.get("linkedin"),
                PERSONAL_INFO.get("twitter"),
                PERSONAL_INFO.get("portfolio"),
                PERSONAL_INFO.get("resume"),
                PERSONAL_INFO.get("bio"),
                PERSONAL_INFO.get("availability"),
                PERSONAL_INFO.get("timezone"),
                json.dumps(PERSONAL_INFO.get("languages", [])),
            ),
        )

    cur.execute("SELECT COUNT(*) FROM skills")
    if cur.fetchone()["count"] == 0:
        for category, data in SKILLS.items():
            cur.execute(
                "INSERT INTO skills (category,title,skills_data) VALUES (%s,%s,%s)",
                (category, data["title"], json.dumps(data["skills"])),
            )

    cur.execute("SELECT COUNT(*) FROM projects")
    if cur.fetchone()["count"] == 0:
        for p in PROJECTS:
            cur.execute(
                """INSERT INTO projects (name,filename,version,downloads,description,technologies,
                   features,stars,forks,demo_url,github_url,status,featured)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (
                    p["name"],
                    p.get("filename"),
                    p.get("version"),
                    p.get("downloads"),
                    p["description"],
                    json.dumps(p.get("technologies", [])),
                    json.dumps(p.get("features", [])),
                    p.get("stars", 0),
                    p.get("forks", 0),
                    p.get("demoUrl"),
                    p.get("githubUrl"),
                    p.get("status", "active"),
                    bool(p.get("featured")),
                ),
            )

    cur.execute("SELECT COUNT(*) FROM experience")
    if cur.fetchone()["count"] == 0:
        for e in EXPERIENCE:
            cur.execute(
                """INSERT INTO experience (title,company,location,period,duration,type,
                   description,achievements,technologies)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (
                    e["title"],
                    e["company"],
                    e.get("location"),
                    e.get("period"),
                    e.get("duration"),
                    e.get("type"),
                    e["description"],
                    json.dumps(e.get("achievements", [])),
                    json.dumps(e.get("technologies", [])),
                ),
            )

    cur.execute("SELECT COUNT(*) FROM testimonials")
    if cur.fetchone()["count"] == 0:
        for t in TESTIMONIALS:
            cur.execute(
                "INSERT INTO testimonials (name,role,company,text,rating,date) VALUES (%s,%s,%s,%s,%s,%s)",
                (
                    t["name"],
                    t["role"],
                    t["company"],
                    t["text"],
                    t.get("rating", 5),
                    t.get("date"),
                ),
            )

    cur.execute("SELECT COUNT(*) FROM achievements")
    if cur.fetchone()["count"] == 0:
        for category, data in ACHIEVEMENTS.items():
            cur.execute(
                "INSERT INTO achievements (category,data) VALUES (%s,%s)",
                (category, json.dumps(data)),
            )

    cur.execute("SELECT COUNT(*) FROM blog_posts")
    if cur.fetchone()["count"] == 0:
        for post in BLOG_POSTS:
            cur.execute(
                """INSERT INTO blog_posts (title,excerpt,date,read_time,tags,featured)
                   VALUES (%s,%s,%s,%s,%s,%s)""",
                (
                    post["title"],
                    post.get("excerpt"),
                    post.get("date"),
                    post.get("readTime"),
                    json.dumps(post.get("tags", [])),
                    bool(post.get("featured")),
                ),
            )

    conn.commit()
    cur.close()
    conn.close()


class Database:
    def __init__(self):
        init_database()
        _init_default_data()

    # ── Personal Info ──────────────────────────────────────────────────
    def get_personal_info(self) -> Dict[str, Any]:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT * FROM personal_info ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return {}
        r = dict(row)
        r["languages"] = json.loads(r["languages"]) if r.get("languages") else []
        return r

    def update_personal_info(self, data: Dict[str, Any]) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """UPDATE personal_info SET
               name=%s,role=%s,title=%s,location=%s,status=%s,experience=%s,
               email=%s,phone=%s,github=%s,linkedin=%s,twitter=%s,portfolio=%s,
               resume=%s,bio=%s,availability=%s,timezone=%s,languages=%s,
               updated_at=CURRENT_TIMESTAMP
               WHERE id=(SELECT id FROM personal_info ORDER BY id DESC LIMIT 1)""",
            (
                data.get("name"),
                data.get("role"),
                data.get("title"),
                data.get("location"),
                data.get("status"),
                data.get("experience"),
                data.get("email"),
                data.get("phone"),
                data.get("github"),
                data.get("linkedin"),
                data.get("twitter"),
                data.get("portfolio"),
                data.get("resume"),
                data.get("bio"),
                data.get("availability"),
                data.get("timezone"),
                json.dumps(data.get("languages", [])),
            ),
        )
        conn.commit()
        cur.close()
        conn.close()
        return True

    # ── Skills ────────────────────────────────────────────────────────
    def get_skills(self) -> Dict[str, Any]:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT * FROM skills")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return {
            r["category"]: {"title": r["title"], "skills": json.loads(r["skills_data"])}
            for r in rows
        }

    def update_skills_category(self, category: str, data: Dict[str, Any]) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT id FROM skills WHERE category=%s", (category,))
        row = cur.fetchone()
        if row:
            cur.execute(
                "UPDATE skills SET title=%s,skills_data=%s,updated_at=CURRENT_TIMESTAMP WHERE category=%s",
                (data["title"], json.dumps(data["skills"]), category),
            )
        else:
            cur.execute(
                "INSERT INTO skills (category,title,skills_data) VALUES (%s,%s,%s)",
                (category, data["title"], json.dumps(data["skills"])),
            )
        conn.commit()
        cur.close()
        conn.close()
        return True

    def delete_skills_category(self, category: str) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("DELETE FROM skills WHERE category=%s", (category,))
        conn.commit()
        cur.close()
        conn.close()
        return True

    # ── Projects ──────────────────────────────────────────────────────
    def _parse_project(self, r) -> Dict[str, Any]:
        return {
            "id": r["id"],
            "name": r["name"],
            "filename": r.get("filename"),
            "version": r.get("version"),
            "downloads": r.get("downloads"),
            "description": r.get("description"),
            "technologies": (
                json.loads(r["technologies"]) if r.get("technologies") else []
            ),
            "features": json.loads(r["features"]) if r.get("features") else [],
            "stars": r.get("stars", 0),
            "forks": r.get("forks", 0),
            "demoUrl": r.get("demo_url"),
            "githubUrl": r.get("github_url"),
            "status": r.get("status"),
            "featured": bool(r.get("featured")),
        }

    def get_projects(self) -> List[Dict[str, Any]]:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT * FROM projects ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [self._parse_project(r) for r in rows]

    def add_project(self, data: Dict[str, Any]) -> int:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """INSERT INTO projects (name,filename,version,downloads,description,technologies,
               features,stars,forks,demo_url,github_url,status,featured)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (
                data["name"],
                data.get("filename"),
                data.get("version"),
                data.get("downloads"),
                data["description"],
                json.dumps(data.get("technologies", [])),
                json.dumps(data.get("features", [])),
                data.get("stars", 0),
                data.get("forks", 0),
                data.get("demoUrl"),
                data.get("githubUrl"),
                data.get("status", "active"),
                bool(data.get("featured")),
            ),
        )
        project_id = cur.fetchone()["id"]
        conn.commit()
        cur.close()
        conn.close()
        return project_id

    def update_project(self, project_id: int, data: Dict[str, Any]) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """UPDATE projects SET name=%s,filename=%s,version=%s,downloads=%s,description=%s,
               technologies=%s,features=%s,stars=%s,forks=%s,demo_url=%s,github_url=%s,
               status=%s,featured=%s,updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
            (
                data.get("name"),
                data.get("filename"),
                data.get("version"),
                data.get("downloads"),
                data.get("description"),
                json.dumps(data.get("technologies", [])),
                json.dumps(data.get("features", [])),
                data.get("stars", 0),
                data.get("forks", 0),
                data.get("demoUrl"),
                data.get("githubUrl"),
                data.get("status"),
                bool(data.get("featured")),
                project_id,
            ),
        )
        conn.commit()
        cur.close()
        conn.close()
        return True

    def delete_project(self, project_id: int) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("DELETE FROM projects WHERE id=%s", (project_id,))
        conn.commit()
        cur.close()
        conn.close()
        return True

    # ── Experience ────────────────────────────────────────────────────
    def _parse_exp(self, r) -> Dict[str, Any]:
        return {
            "id": r["id"],
            "title": r["title"],
            "company": r["company"],
            "location": r.get("location"),
            "period": r.get("period"),
            "duration": r.get("duration"),
            "type": r.get("type"),
            "description": r.get("description"),
            "achievements": (
                json.loads(r["achievements"]) if r.get("achievements") else []
            ),
            "technologies": (
                json.loads(r["technologies"]) if r.get("technologies") else []
            ),
            "commit": r.get("commit_hash"),
            "color": r.get("color"),
            "badge": r.get("badge"),
        }

    def get_experience(self) -> List[Dict[str, Any]]:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT * FROM experience ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [self._parse_exp(r) for r in rows]

    def add_experience(self, data: Dict[str, Any]) -> int:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """INSERT INTO experience (title,company,location,period,duration,type,
               description,achievements,technologies,commit_hash,color,badge)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (
                data["title"],
                data["company"],
                data.get("location"),
                data.get("period"),
                data.get("duration"),
                data.get("type"),
                data["description"],
                json.dumps(data.get("achievements", [])),
                json.dumps(data.get("technologies", [])),
                data.get("commit"),
                data.get("color"),
                data.get("badge"),
            ),
        )
        exp_id = cur.fetchone()["id"]
        conn.commit()
        cur.close()
        conn.close()
        return exp_id

    def update_experience(self, exp_id: int, data: Dict[str, Any]) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """UPDATE experience SET
               title=COALESCE(%s,title), company=COALESCE(%s,company),
               location=COALESCE(%s,location), period=COALESCE(%s,period),
               duration=COALESCE(%s,duration), type=COALESCE(%s,type),
               description=COALESCE(%s,description),
               achievements=COALESCE(%s,achievements),
               technologies=COALESCE(%s,technologies),
               commit_hash=COALESCE(%s,commit_hash),
               color=COALESCE(%s,color), badge=COALESCE(%s,badge),
               updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
            (
                data.get("title"),
                data.get("company"),
                data.get("location"),
                data.get("period"),
                data.get("duration"),
                data.get("type"),
                data.get("description"),
                (
                    json.dumps(data["achievements"])
                    if data.get("achievements") is not None
                    else None
                ),
                (
                    json.dumps(data["technologies"])
                    if data.get("technologies") is not None
                    else None
                ),
                data.get("commit"),
                data.get("color"),
                data.get("badge"),
                exp_id,
            ),
        )
        conn.commit()
        cur.close()
        conn.close()
        return True

    def delete_experience(self, exp_id: int) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("DELETE FROM experience WHERE id=%s", (exp_id,))
        conn.commit()
        cur.close()
        conn.close()
        return True

    # ── Education ─────────────────────────────────────────────────────
    def _parse_edu(self, r) -> Dict[str, Any]:
        return {
            "id": r["id"],
            "degree": r["degree"],
            "school": r["school"],
            "location": r.get("location"),
            "period": r.get("period"),
            "gpa": r.get("gpa"),
            "relevant_courses": (
                json.loads(r["relevant_courses"]) if r.get("relevant_courses") else []
            ),
            "achievements": (
                json.loads(r["achievements"]) if r.get("achievements") else []
            ),
            "focus": r.get("focus"),
            "certification": r.get("certification"),
            "duration": r.get("duration"),
        }

    def get_education(self) -> List[Dict[str, Any]]:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT * FROM education ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [self._parse_edu(r) for r in rows]

    def add_education(self, data: Dict[str, Any]) -> int:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """INSERT INTO education (degree,school,location,period,gpa,
               relevant_courses,achievements,focus,certification,duration)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (
                data["degree"],
                data["school"],
                data.get("location"),
                data.get("period"),
                data.get("gpa"),
                json.dumps(data.get("relevant_courses", [])),
                json.dumps(data.get("achievements", [])),
                data.get("focus"),
                data.get("certification"),
                data.get("duration"),
            ),
        )
        edu_id = cur.fetchone()["id"]
        conn.commit()
        cur.close()
        conn.close()
        return edu_id

    def update_education(self, edu_id: int, data: Dict[str, Any]) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """UPDATE education SET
               degree=COALESCE(%s,degree), school=COALESCE(%s,school),
               location=COALESCE(%s,location), period=COALESCE(%s,period),
               gpa=COALESCE(%s,gpa),
               relevant_courses=COALESCE(%s,relevant_courses),
               achievements=COALESCE(%s,achievements),
               focus=COALESCE(%s,focus), certification=COALESCE(%s,certification),
               duration=COALESCE(%s,duration), updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
            (
                data.get("degree"),
                data.get("school"),
                data.get("location"),
                data.get("period"),
                data.get("gpa"),
                (
                    json.dumps(data["relevant_courses"])
                    if data.get("relevant_courses") is not None
                    else None
                ),
                (
                    json.dumps(data["achievements"])
                    if data.get("achievements") is not None
                    else None
                ),
                data.get("focus"),
                data.get("certification"),
                data.get("duration"),
                edu_id,
            ),
        )
        conn.commit()
        cur.close()
        conn.close()
        return True

    def delete_education(self, edu_id: int) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("DELETE FROM education WHERE id=%s", (edu_id,))
        conn.commit()
        cur.close()
        conn.close()
        return True

    # ── Certifications ────────────────────────────────────────────────
    def get_certifications(self) -> List[Dict[str, Any]]:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT * FROM certifications ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [dict(r) for r in rows]

    def add_certification(self, data: Dict[str, Any]) -> int:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """INSERT INTO certifications (name,issuer,date,credential,validity,badge,verify_url)
               VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (
                data["name"],
                data["issuer"],
                data.get("date"),
                data.get("credential"),
                data.get("validity"),
                data.get("badge"),
                data.get("verify_url"),
            ),
        )
        cert_id = cur.fetchone()["id"]
        conn.commit()
        cur.close()
        conn.close()
        return cert_id

    def update_certification(self, cert_id: int, data: Dict[str, Any]) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """UPDATE certifications SET
               name=COALESCE(%s,name), issuer=COALESCE(%s,issuer),
               date=COALESCE(%s,date), credential=COALESCE(%s,credential),
               validity=COALESCE(%s,validity), badge=COALESCE(%s,badge),
               verify_url=COALESCE(%s,verify_url), updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
            (
                data.get("name"),
                data.get("issuer"),
                data.get("date"),
                data.get("credential"),
                data.get("validity"),
                data.get("badge"),
                data.get("verify_url"),
                cert_id,
            ),
        )
        conn.commit()
        cur.close()
        conn.close()
        return True

    def delete_certification(self, cert_id: int) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("DELETE FROM certifications WHERE id=%s", (cert_id,))
        conn.commit()
        cur.close()
        conn.close()
        return True

    # ── Achievements ──────────────────────────────────────────────────
    def get_achievements(self) -> Dict[str, Any]:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT category, data FROM achievements")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        result = {"stats": {}, "highlights": []}
        for r in rows:
            result[r["category"]] = json.loads(r["data"])
        return result

    def update_achievements(self, category: str, data: Any) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT id FROM achievements WHERE category=%s", (category,))
        row = cur.fetchone()
        if row:
            cur.execute(
                "UPDATE achievements SET data=%s,updated_at=CURRENT_TIMESTAMP WHERE category=%s",
                (json.dumps(data), category),
            )
        else:
            cur.execute(
                "INSERT INTO achievements (category,data) VALUES (%s,%s)",
                (category, json.dumps(data)),
            )
        conn.commit()
        cur.close()
        conn.close()
        return True

    # ── Testimonials ──────────────────────────────────────────────────
    def get_testimonials(self) -> List[Dict[str, Any]]:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT * FROM testimonials ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return [dict(r) for r in rows]

    def add_testimonial(self, data: Dict[str, Any]) -> int:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            "INSERT INTO testimonials (name,role,company,text,rating,date) VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
            (data["name"], data["role"], data["company"], data["text"], data.get("rating", 5), data.get("date"))
        )
        tid = cur.fetchone()["id"]
        conn.commit(); cur.close(); conn.close()
        return tid

    def update_testimonial(self, testimonial_id: int, data: Dict[str, Any]) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """UPDATE testimonials SET name=%s,role=%s,company=%s,text=%s,
               rating=%s,date=%s,updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
            (data.get("name"), data.get("role"), data.get("company"), data.get("text"),
             data.get("rating", 5), data.get("date"), testimonial_id)
        )
        conn.commit(); cur.close(); conn.close()
        return True

    def delete_testimonial(self, testimonial_id: int) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("DELETE FROM testimonials WHERE id=%s", (testimonial_id,))
        conn.commit(); cur.close(); conn.close()
        return True

    # ── Blog Posts ────────────────────────────────────────────────────
    def get_blog_posts(self) -> List[Dict[str, Any]]:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT * FROM blog_posts ORDER BY date DESC")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return [{
            "id": r["id"], "title": r["title"], "excerpt": r.get("excerpt"),
            "date": r.get("date"), "readTime": r.get("read_time"),
            "tags": json.loads(r["tags"]) if r.get("tags") else [],
            "featured": bool(r.get("featured")),
        } for r in rows]

    def add_blog_post(self, data: Dict[str, Any]) -> int:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """INSERT INTO blog_posts (title,excerpt,date,read_time,tags,featured)
               VALUES (%s,%s,%s,%s,%s,%s) RETURNING id""",
            (data["title"], data.get("excerpt"), data.get("date"), data.get("readTime"),
             json.dumps(data.get("tags", [])), bool(data.get("featured")))
        )
        post_id = cur.fetchone()["id"]
        conn.commit(); cur.close(); conn.close()
        return post_id

    def update_blog_post(self, post_id: int, data: Dict[str, Any]) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """UPDATE blog_posts SET title=%s,excerpt=%s,date=%s,read_time=%s,
               tags=%s,featured=%s,updated_at=CURRENT_TIMESTAMP WHERE id=%s""",
            (data.get("title"), data.get("excerpt"), data.get("date"), data.get("readTime"),
             json.dumps(data.get("tags", [])), bool(data.get("featured")), post_id)
        )
        conn.commit(); cur.close(); conn.close()
        return True

    def delete_blog_post(self, post_id: int) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("DELETE FROM blog_posts WHERE id=%s", (post_id,))
        conn.commit(); cur.close(); conn.close()
        return True

    # ── Contact Messages ──────────────────────────────────────────────
    def add_contact_message(self, name: str, email: str, subject: str, message: str) -> int:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            "INSERT INTO contact_messages (name,email,subject,message) VALUES (%s,%s,%s,%s) RETURNING id",
            (name, email, subject or "", message)
        )
        msg_id = cur.fetchone()["id"]
        conn.commit(); cur.close(); conn.close()
        return msg_id

    def get_contact_messages(self) -> List[Dict[str, Any]]:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("SELECT id,name,email,subject,message,created_at FROM contact_messages ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return [dict(r) for r in rows]

    def delete_contact_message(self, message_id: int) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute("DELETE FROM contact_messages WHERE id=%s", (message_id,))
        conn.commit(); cur.close(); conn.close()
        return True

    # ── Analytics ─────────────────────────────────────────────────────
    def track_visit(self, data: Dict[str, Any]) -> int:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            """INSERT INTO analytics (visitor_id,session_id,ip_address,device_type,
               browser,referrer,page_path,location_country,location_city)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
            (data["visitor_id"], data["session_id"], data.get("ip_address"),
             data.get("device_type"), data.get("browser"), data.get("referrer"),
             data.get("page_path", "/"), data.get("location_country"), data.get("location_city"))
        )
        visit_id = cur.fetchone()["id"]
        conn.commit(); cur.close(); conn.close()
        return visit_id

    def update_duration(self, session_id: str, duration: int) -> bool:
        conn = get_connection()
        cur = _cursor(conn)
        cur.execute(
            "UPDATE analytics SET duration=COALESCE(%s,duration),last_active=CURRENT_TIMESTAMP WHERE session_id=%s",
            (duration, session_id)
        )
        conn.commit(); cur.close(); conn.close()
        return True

    def get_analytics_summary(self) -> Dict[str, Any]:
        conn = get_connection()
        cur = _cursor(conn)

        cur.execute("SELECT COUNT(*) as c FROM analytics")
        total_visits = cur.fetchone()["c"]

        cur.execute("SELECT COUNT(DISTINCT visitor_id) as c FROM analytics")
        unique_visitors = cur.fetchone()["c"]

        cur.execute("SELECT COUNT(DISTINCT visitor_id) as c FROM analytics WHERE last_active >= NOW() - INTERVAL '5 minutes'")
        active_users = cur.fetchone()["c"]

        cur.execute("SELECT device_type, COUNT(*) as count FROM analytics GROUP BY device_type")
        device_breakdown = {(r["device_type"] or "Unknown"): r["count"] for r in cur.fetchall()}

        cur.execute("SELECT page_path, COUNT(*) as count FROM analytics GROUP BY page_path ORDER BY count DESC LIMIT 10")
        top_pages = [{"path": r["page_path"], "visits": r["count"]} for r in cur.fetchall()]

        cur.execute("""SELECT DATE(created_at) as visit_date, COUNT(*) as visits,
                    COUNT(DISTINCT visitor_id) as unique_visitors FROM analytics
                    WHERE created_at >= NOW() - INTERVAL '30 days'
                    GROUP BY DATE(created_at) ORDER BY DATE(created_at)""")
        daily_traffic = [{"date": str(r["visit_date"]), "visits": r["visits"], "unique": r["unique_visitors"]}
                         for r in cur.fetchall()]

        cur.execute("""SELECT location_country, COUNT(*) as count FROM analytics
                    WHERE location_country IS NOT NULL
                    GROUP BY location_country ORDER BY count DESC LIMIT 10""")
        countries = {r["location_country"]: r["count"] for r in cur.fetchall()}

        cur.execute("""SELECT COUNT(*) as total,
                    SUM(CASE WHEN session_count > 1 THEN 1 ELSE 0 END) as returning_count
                    FROM (SELECT visitor_id, COUNT(DISTINCT session_id) as session_count
                    FROM analytics GROUP BY visitor_id) sub""")
        vs = cur.fetchone()
        total_u = vs["total"] or 0
        returning = vs["returning_count"] or 0

        cur.execute("""SELECT (CAST(COUNT(CASE WHEN duration < 5 THEN 1 END) AS FLOAT)
                    / NULLIF(COUNT(*),0)) * 100 as bounce_rate FROM analytics""")
        bounce_rate = round(cur.fetchone()["bounce_rate"] or 0, 2)

        cur.close(); conn.close()
        return {
            "totalVisits": total_visits, "uniqueVisitors": unique_visitors,
            "activeUsers": active_users, "deviceBreakdown": device_breakdown,
            "topPages": top_pages, "dailyTraffic": daily_traffic,
            "countries": countries,
            "newVsReturning": {"new": total_u - returning, "returning": returning},
            "bounceRate": bounce_rate,
        }

    # ── JWT Revocation / Blacklist ──────────────────────────────────────
    def revoke_token(self, jti: str, token_type: str, username: str, expires_at) -> bool:
        """Store revoked JWT jti in database."""
        conn = get_connection()
        cur = _cursor(conn)
        try:
            cur.execute(
                """INSERT INTO revoked_tokens (jti, token_type, username, expires_at)
                   VALUES (%s, %s, %s, %s)
                   ON CONFLICT (jti) DO NOTHING""",
                (jti, token_type, username, expires_at),
            )
            conn.commit()
            return True
        except Exception:
            conn.rollback()
            return False
        finally:
            cur.close()
            conn.close()

    def is_token_revoked(self, jti: str) -> bool:
        """Check whether a JWT jti is blacklisted."""
        conn = get_connection()
        cur = _cursor(conn)
        try:
            cur.execute("SELECT 1 FROM revoked_tokens WHERE jti = %s", (jti,))
            return cur.fetchone() is not None
        except Exception:
            return False
        finally:
            cur.close()
            conn.close()

    def cleanup_expired_revoked_tokens(self) -> int:
        """Prune expired revoked tokens from the database."""
        conn = get_connection()
        cur = _cursor(conn)
        try:
            cur.execute("DELETE FROM revoked_tokens WHERE expires_at < CURRENT_TIMESTAMP")
            deleted = cur.rowcount
            conn.commit()
            return deleted
        except Exception:
            conn.rollback()
            return 0
        finally:
            cur.close()
            conn.close()


# Global instance
db = Database()
