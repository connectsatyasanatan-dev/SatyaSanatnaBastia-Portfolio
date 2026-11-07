# Enterprise REST API Reference & System Architecture Specification

## Executive Overview
This API serves as the centralized backend service for the **VS Code Interactive Developer Portfolio**. It provides a high-throughput, horizontally scalable, and secure RESTful interface built with Python Flask and PostgreSQL, integrated with a Next.js 14 App Router frontend.

The system is architected into three distinct operational domains:
1. **Public Read-Only & Interaction API**: High-speed, cached endpoints serving portfolio data, contact submissions, visitor analytics, and Generative Engine Optimization (GEO/AEO/AIO) feeds for AI crawlers.
2. **AI Representative Engine (Zentara AI)**: Multi-model conversational AI with dynamic LLM routing (Groq LLaMA 3.3, NVIDIA NIM, OpenAI fallback), offline heuristic NLP, sentiment analysis, and automated recruiter lead extraction.
3. **Hardened Admin CMS API**: Secure content management system implementing dual-token authentication with Refresh Token Rotation (RTR), bank-grade HttpOnly cookies, section visibility management, festive theming, media uploads, and disaster recovery.

---

## 🌐 Network Topology & Base URLs

| Environment | Base URL | Origin CORS Whitelist | Caching Policy |
| :--- | :--- | :--- | :--- |
| **Local Development** | `http://localhost:5000/api` | `http://localhost:3000`, `http://127.0.0.1:3000` | No-cache on mutating endpoints; in-memory cache for static read queries |
| **Production** | `https://<domain>/api` | Strictly bounded to production frontend domain | Cloudflare / CDN edge caching for public assets; zero-cache for admin & auth |

### Universal Headers & Content Types
* **Request Header**: `Content-Type: application/json` (except `/admin/upload` which requires `multipart/form-data`)
* **Response Header**: `Content-Type: application/json; charset=utf-8`
* **Security Headers**:
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
  * `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  * `Content-Security-Policy: default-src 'self' ...`
  * `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 🔒 Security Architecture & Authentication Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Client (Frontend)
    participant Auth as Flask Auth Route (/api/admin/login)
    participant DB as PostgreSQL (users & revoked_tokens)
    participant CMS as Protected Admin Endpoints

    Admin->>Auth: POST /admin/login {username, password}
    Note over Auth: Verify PBKDF2-SHA256 hash (600,000 iterations)<br/>hmac.compare_digest timing attack defense
    Auth->>Auth: Generate Access Token (15m, JWT) & Refresh Token (24h, JTI)
    Auth-->>Admin: 200 OK + JSON {accessToken} + Set-Cookie: admin_refresh_token (HttpOnly; Secure; SameSite=Lax)
    
    Admin->>CMS: GET /admin/projects (Header: Authorization: Bearer <accessToken>)
    CMS-->>Admin: 200 OK (Protected Data)
    
    Note over Admin,CMS: Access Token expires after 15 minutes
    Admin->>CMS: GET /admin/experience (Expired Token)
    CMS-->>Admin: 401 Unauthorized
    
    Admin->>Auth: POST /admin/refresh (Auto-sent via HttpOnly cookie)
    Note over Auth: Check JTI against revoked_tokens table.<br/>Blacklist old JTI. Issue new token pair (RTR).
    Auth->>DB: INSERT INTO revoked_tokens (jti, revoked_at)
    Auth-->>Admin: 200 OK + New accessToken + Rotated HttpOnly Cookie
    Admin->>CMS: Retry GET /admin/experience with new accessToken
    CMS-->>Admin: 200 OK
```

### Authentication Primitives
1. **Password Hashing**: PBKDF2 with HMAC-SHA256, 600,000 rounds, cryptographically secure 16-byte salt per user. Constant-time comparison (`hmac.compare_digest`) prevents timing attacks.
2. **Access Tokens**: Short-lived (15 minutes). Signed with HMAC-SHA256 (`HS256`). Encodes user ID, username, and token expiration (`exp`). Transmitted via `Authorization: Bearer <token>`.
3. **Refresh Tokens & RTR**: Long-lived (24 hours). Stored in a `HttpOnly; SameSite=Lax; Secure` cookie to eliminate XSS token theft. Each refresh token includes a unique UUID `jti` (JWT ID). When used, the old `jti` is permanently blacklisted in the PostgreSQL `revoked_tokens` table, guaranteeing single-use token rotation.
4. **Brute-Force & Lockout Policy**: 5 consecutive failed login attempts trigger an IP/account lockout for 5 minutes, backed by Flask-Limiter.

---

## 🚦 Rate Limiting Matrix

All incoming requests pass through IP-bound sliding-window limiters:

| Endpoint | Method | Rate Limit | Protection Target |
| :--- | :--- | :--- | :--- |
| `/api/admin/login` | `POST` | **5 failures / 5 min lockout**; `10/min` max | Credential stuffing, brute force attacks |
| `/api/admin/refresh` | `POST` | **30 / minute** | Token generation spam & replay attempts |
| `/api/admin/upload` | `POST` | **20 / minute** | Storage abuse & bandwidth exhaustion |
| `/api/contact` | `POST` | **5 / minute; 20 / hour** | Contact form spam & inbox flooding |
| `/api/chat` | `POST` | **15 / minute; 60 / hour** | LLM API cost spike & DoS protection |
| `/api/track-visit` | `POST` | **30 / minute** | Telemetry spoofing |
| `/api/track-duration`| `POST` | **60 / minute** | Keepalive heartbeat flooding |
| **Global Default** | `ALL` | **200 / minute; 2000 / hour** | General availability & DDoS mitigation |

---

## 📖 Public API Reference (23 Endpoints)

### 1. System Health & Metadata
#### `GET /api/health`
* **Description**: Microservice health check and PostgreSQL connection pool heartbeat.
* **Auth**: None
* **Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "message": "Flask backend is running!",
    "timestamp": 1794060000
  }
  ```

#### `GET /api/stats`
* **Description**: Aggregate public metrics across active sections.
* **Auth**: None
* **Response (200 OK)**:
  ```json
  {
    "total_projects": 8,
    "featured_projects": 3,
    "experience_years": 2,
    "skills_count": 42,
    "certifications_count": 4
  }
  ```

---

### 2. Portfolio Core Content

#### `GET /api/personal-info`
* **Description**: Primary developer identity, bio, job title, social handles, and availability status.
* **Response (200 OK)**:
  ```json
  {
    "name": "Satya Sanatan Bastia",
    "title": "Associate Software Engineer",
    "bio": "Full-stack engineer specialized in Next.js, TypeScript, Python, and AI integration...",
    "location": "Bhubaneswar, Odisha, India",
    "email": "contact@satyasanatan.dev",
    "github": "https://github.com/connectsatyasanatan-dev",
    "linkedin": "https://linkedin.com/in/satya-sanatan",
    "available_for_hire": true
  }
  ```

#### `GET /api/skills`
* **Description**: Full matrix of technical skills grouped by category.
* **Response (200 OK)**:
  ```json
  {
    "frontend": { "name": "Frontend", "skills": ["React.js", "Next.js", "TypeScript", "Tailwind CSS"] },
    "backend": { "name": "Backend", "skills": ["Python", "Flask", "Node.js", "PostgreSQL"] },
    "devops": { "name": "Cloud & DevOps", "skills": ["Docker", "AWS", "Git/GitHub", "CI/CD"] },
    "ai_ml": { "name": "AI & Automation", "skills": ["LangChain", "LLM Integration", "RAG"] }
  }
  ```

#### `GET /api/skills/<category>`
* **Description**: Retrieve skills for a single category (`frontend`, `backend`, `devops`, `ai_ml`, `tools`).

#### `GET /api/projects`
* **Description**: Portfolio projects list. Supports query param `?featured=true` to filter showcased highlights.
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "title": "VS Code Interactive Portfolio",
      "description": "Functional IDE clone with Linux terminal simulator...",
      "technologies": ["Next.js 14", "TypeScript", "Python Flask", "PostgreSQL"],
      "github": "https://github.com/connectsatyasanatan-dev/vs-code_protfolio",
      "live": "https://satyasanatan.dev",
      "featured": true,
      "category": "full-stack",
      "version": "v2.4.0",
      "stars": 12,
      "forks": 3
    }
  ]
  ```

#### `GET /api/projects/<int:project_id>`
* **Description**: Detailed record for a single project by numeric ID.

#### `GET /api/experience`
* **Description**: Career history, roles, tenures, and achievements.
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "title": "Associate Software Engineer",
      "company": "Bourntec Solutions",
      "location": "Bhubaneswar, India",
      "period": "May 2025 – Present",
      "duration": "1 year 6 months",
      "type": "Full-time",
      "badge": "Current Role",
      "color": "cyan",
      "commit": "main@head",
      "description": "Contributing to the design, development, and maintenance of scalable applications...",
      "achievements": [
        "Architected real-time section visibility management system",
        "Optimized Next.js frontend performance to 99+ Core Web Vitals"
      ],
      "technologies": ["Next.js", "Python", "PostgreSQL", "TypeScript"]
    }
  ]
  ```

#### `GET /api/education`
* **Description**: Degrees, universities, grades, and coursework.

#### `GET /api/certifications`
* **Description**: Verified cloud and engineering certificates with credential verification URLs.

#### `GET /api/achievements`
* **Description**: Milestone records and key development metrics.

#### `GET /api/testimonials`
* **Description**: Recommendations from colleagues, managers, and clients.

#### `GET /api/blog`
* **Description**: Published tech articles with tag filtering and reading times.

---

### 3. User Interactions & Telemetry

#### `POST /api/contact`
* **Description**: Contact message intake with strict validation and rate limiting.
* **Rate Limit**: 5/minute, 20/hour.
* **Payload**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Full-Stack Opportunity",
    "message": "Hi Satya, we'd love to discuss an engineering role with our team..."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Your message has been delivered successfully. Thank you!"
  }
  ```

#### `POST /api/track-visit`
* **Description**: Records page navigation, device architecture, and unique visitor sessions.
* **Payload**:
  ```json
  {
    "visitorId": "v_d74a9810",
    "sessionId": "s_f12b6574",
    "page": "/",
    "referrer": "https://linkedin.com",
    "device": "Desktop",
    "browser": "Chrome"
  }
  ```

#### `POST /api/track-duration`
* **Description**: Heartbeat beacon updating active on-site dwell time.

---

### 4. AI Representative Engine (Zentara AI)

#### `POST /api/chat`
* **Description**: Multi-turn dialogue with Zentara AI. Automatically extracts recruiter contact details and analyzes sentiment.
* **Rate Limit**: 15/minute, 60/hour.
* **Payload**:
  ```json
  {
    "message": "Are you open to full-time remote engineering roles?",
    "history": [
      { "role": "user", "content": "Hi Zentara" },
      { "role": "assistant", "content": "Hello! I am Zentara, Satya's AI representative." }
    ],
    "hour": 15,
    "sessionId": "cs_9f81a7b2"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "response": "Yes! Satya is actively exploring full-time opportunities...",
    "suggestions": [
      "View Key Projects",
      "Check Technical Skills",
      "Download Resume"
    ],
    "sentiment": "recruiter_intent",
    "lead_detected": true
  }
  ```

#### `POST /api/chat/lock-lead`
* **Description**: Confirms and logs high-priority recruiter lead information for immediate admin notification.

---

### 5. Generative Engine Optimization (GEO / AEO / AIO)

#### `GET /api/geo`
* **Description**: Structured JSON schema feed engineered for ingestion by Generative AI engines (ChatGPT, Claude, Gemini, Perplexity).
* **Response (200 OK)**:
  Includes canonical profile summary, skill taxonomy, notable projects, technical accomplishments, and availability parameters.

#### `GET /api/aeo-data`
* **Description**: Direct Question-and-Answer knowledge graph formatted for Answer Engine Optimization.

#### `GET /api/llms-context`
* **Description**: RFC-standard plain text summary for raw LLM parser consumption (`llms.txt`).

---

### 6. Dynamic System Configuration

#### `GET /api/festive-theme`
* **Description**: Returns currently active festival theme (e.g. Diwali, Christmas, New Year, Holi, Standard) with color accents, particle counts, and decorative assets.

#### `GET /api/section-visibility`
* **Description**: Public mapping of visible vs hidden portfolio sections.
* **Response (200 OK)**:
  ```json
  {
    "hero": true,
    "about": true,
    "skills": true,
    "projects": true,
    "experience": true,
    "education": true,
    "certifications": true,
    "achievements": true,
    "testimonials": true,
    "blog": true,
    "contact": true
  }
  ```

---

## 🛡️ Secured Admin API Reference (50 Endpoints)

All endpoints in this section require:
`Authorization: Bearer <access_token>`

### 1. Authentication & Session Management

| Endpoint | Method | Payload / Headers | Description |
| :--- | :--- | :--- | :--- |
| `/api/admin/login` | `POST` | `{"username": "...", "password": "..."}` | Authenticates admin credentials, sets HttpOnly refresh cookie, returns 15m access token. |
| `/api/admin/refresh` | `POST` | Cookie `admin_refresh_token` or JSON `{"refreshToken": "..."}` | Validates JTI, invalidates previous refresh token in database, issues new token pair (RTR). |
| `/api/admin/logout` | `POST` | Active Bearer Header | Revokes active access token and refresh token JTIs in PostgreSQL blocklist. Clears cookies. |
| `/api/admin/verify` | `GET` | Bearer Header | Verifies whether the current token session is active and valid. |

---

### 2. Content Management (Full CRUD)

| Module | Endpoints | Supported Operations & Business Rules |
| :--- | :--- | :--- |
| **Projects** | `GET /api/admin/projects`<br>`POST /api/admin/projects`<br>`PUT /api/admin/projects/<id>`<br>`DELETE /api/admin/projects/<id>` | Manages portfolio projects. Fields: `title`, `description`, `technologies` (JSON array), `github`, `live`, `featured` (bool), `category`, `version`. |
| **Experience** | `GET /api/admin/experience`<br>`POST /api/admin/experience`<br>`PUT /api/admin/experience/<id>`<br>`DELETE /api/admin/experience/<id>` | Career timeline. Auto-calculates inclusive duration (`1 year 6 months`). Dynamically evaluates active status. Clears stale `badge` values in PostgreSQL when closed date is supplied. |
| **Skills** | `GET /api/admin/skills`<br>`PUT /api/admin/skills/<category>`<br>`POST /api/admin/skills/<category>/skill` | Skills hierarchy. Add individual skill or replace an entire category's array. |
| **Education** | `GET /api/admin/education`<br>`POST /api/admin/education`<br>`PUT /api/admin/education/<id>`<br>`DELETE /api/admin/education/<id>` | Academic credentials, degree names, university locations, CGPA/marks, and graduation years. |
| **Certifications** | `GET /api/admin/certifications`<br>`POST /api/admin/certifications`<br>`PUT /api/admin/certifications/<id>`<br>`DELETE /api/admin/certifications/<id>` | Professional licenses, issuing organizations, verification IDs, and badge image URLs. |
| **Achievements** | `GET /api/admin/achievements`<br>`PUT /api/admin/achievements/<category>` | Milestone metrics, competitive programming stats, and hackathon awards. |
| **Testimonials** | `GET /api/admin/testimonials`<br>`POST /api/admin/testimonials`<br>`PUT /api/admin/testimonials/<id>`<br>`DELETE /api/admin/testimonials/<id>` | Endorsement reviews, recommender roles, avatar URLs, ratings (1–5 stars), and endorsement text. |
| **Blog** | `GET /api/admin/blog`<br>`POST /api/admin/blog`<br>`PUT /api/admin/blog/<id>`<br>`DELETE /api/admin/blog/<id>` | Article management with Markdown support, tags, cover images, read times, and publication status. |
| **Personal Info**| `GET /api/admin/personal-info`<br>`PUT /api/admin/personal-info` | Updates developer identity, headline, bio, contact email, social links, and open-for-work status. |

---

### 3. Contact & Communication Management

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/admin/contacts` | `GET` | Fetches all received visitor contact submissions ordered chronologically. |
| `DELETE /api/admin/contacts/<id>` | `DELETE` | Permanently deletes a contact message entry. |
| `GET /api/admin/chat-logs` | `GET` | Retrieves full conversation transcripts between visitors and Zentara AI. |
| `GET /api/admin/ai-leads` | `GET` | Returns list of detected recruiter leads with company, email, and sentiment classification. |
| `DELETE /api/admin/ai-leads/<id>` | `DELETE` | Deletes or archives an AI lead entry. |

---

### 4. System Controls & Administration

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/admin/dashboard` | `GET` | Executive dashboard aggregate: total views, unread messages, active leads, project counts. |
| `GET /api/admin/analytics` | `GET` | Detailed telemetry: daily views, unique visitors, browser distribution, and device breakdowns. |
| `POST /api/admin/upload` | `POST` | Media file upload. Supports `.png`, `.jpg`, `.jpeg`, `.webp`, `.pdf`. Streams to Cloudinary (Production) or local disk (Development). |
| `GET /api/admin/backup` | `GET` | Exports complete database snapshot as a timestamped, downloadable JSON file (`portfolio_backup_YYYYMMDD_HHMMSS.json`). |
| `POST /api/admin/restore` | `POST` | Restores database tables from an uploaded JSON backup snapshot with atomic transaction rollback on failure. |
| `GET /api/admin/festive-theme` | `GET` | Returns full festival configuration and active seasonal overrides. |
| `PUT /api/admin/festive-theme` | `PUT` | Updates active festive theme (`diwali`, `christmas`, `new-year`, `holi`, `none`), colors, and banner toggles. |
| `GET /api/admin/section-visibility`| `GET` | Retrieves exact database state of section toggles. |
| `PUT /api/admin/section-visibility`| `PUT` | Bulk updates visibility for all 10 portfolio sections with safety validation (requires at least 1 section visible). |

---

## ⚙️ Core Business Logic & Algorithmic Specifications

### 1. Work Tenure & Inclusive Duration Math
```
Formula:
Total Months = ((End Year - Start Year) * 12) + (End Month Index - Start Month Index) + 1
```

* **Inclusive Calculation**: If an engineer works from `May 2024` to `Apr 2025`:
  $$\text{Total Months} = ((2025 - 2024) \times 12) + (3 - 4) + 1 = 12 - 1 + 1 = 12\text{ months} = 1\text{ year}$$
* **Multiple Years & Months**: `May 2025` to `Oct 2026`:
  $$\text{Total Months} = ((2026 - 2025) \times 12) + (9 - 4) + 1 = 12 + 5 + 1 = 18\text{ months} = 1\text{ year } 6\text{ months}$$
* **Dynamic Present Calculation**: When marked as `Present`:
  $$\text{End Year} = \text{Date.now().getFullYear()}, \quad \text{End Month} = \text{Date.now().getMonth()}$$

### 2. Role Status Determination State Machine
To eliminate false positives where past closed roles were incorrectly tagged as `CURRENT ROLE`:
```ts
export function isRoleActive(period?: string, badge?: string): boolean {
    const p = (period || '').trim().toLowerCase()
    if (!p) return Boolean(badge && /\b(current|active)\b/i.test(badge))
    
    // Explicit keywords
    if (/\b(present|current|now|ongoing)\b/i.test(p)) return true

    // Check for explicit closed date after separator (-, –, —, to)
    const separatorMatch = p.match(/\s*(?:[-–—]|(?:\bto\b))\s*/)
    if (separatorMatch && separatorMatch.index !== undefined) {
        const endPart = p.slice(separatorMatch.index + separatorMatch[0].length).trim()
        if (/\b(present|current|now|ongoing)\b/i.test(endPart)) return true
        // If end part contains a 4-digit year or month, it is strictly a COMPLETED past role
        if (/\b(19\d\d|20\d\d)\b/.test(endPart) || MONTHS.some(m => new RegExp(`\\b${m}\\b`, 'i').test(endPart))) {
            return false
        }
    }
    
    return Boolean(badge && /\b(current|active)\b/i.test(badge))
}
```

### 3. Section Visibility Zero-Space DOM Unmounting
* **Problem**: Hiding sections with CSS (`display: none` or `opacity: 0`) leaves phantom scroll offsets, blank breadcrumb tabs, and invalid Command Palette results.
* **Solution**: `useSectionVisibility` singleton store coupled with `SectionVisibilityWrapper.tsx`:
  - When hidden: Component renders `null` (zero blank space in DOM).
  - Navigation sync: Sidebar file tree, TabBar breadcrumb tabs, and Command Palette results (`Ctrl+P`) dynamically filter out hidden sections.

---

## 💻 Frontend Client Architecture & Axios Interceptors

### Dual-Interceptor Pattern (`admin-api.ts`)
```ts
// Request Interceptor: Injects short-lived Access Token
adminApiClient.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Response Interceptor: Seamless Refresh Token Rotation on 401
adminApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                // Auto-refresh via HttpOnly cookie
                const { accessToken } = await refreshAccessToken()
                setAccessToken(accessToken)
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return adminApiClient(originalRequest) // Replay queued request
            } catch (refreshErr) {
                clearAuth()
                window.location.href = '/admin'
                return Promise.reject(refreshErr)
            }
        }
        return Promise.reject(error)
    }
)
```

---

## 🛠️ Maintenance & Deployment Checklist

1. **Database Migrations**: Database tables (`experience`, `projects`, `section_visibility`, `site_settings`, `revoked_tokens`) automatically create if non-existent upon `python app.py` startup via `init_db()`.
2. **Environment Variables**:
   * `SECRET_KEY`: High-entropy string for JWT signing.
   * `DATABASE_URL`: PostgreSQL connection string (`postgresql://user:pass@host:5432/dbname`).
   * `ADMIN_USERNAME`: Admin login username.
   * `ADMIN_PASSWORD_HASH`: Pre-computed PBKDF2 hash or plain password for first-time seeding.
   * `GROQ_API_KEY`: API key for Groq LLaMA 3.3.
   * `CLOUDINARY_URL`: Optional CDN storage URL.
3. **TypeScript Verification**: Always run `npm run type-check --prefix frontend` before production deployments.
4. **Git Policy**: All ongoing fixes are staged or tested locally; production branch commits require passing builds and 0 security vulnerabilities.
