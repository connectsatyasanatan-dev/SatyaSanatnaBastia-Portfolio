# REST API Reference & Technical Specification

## Overview
This API is designed as a **high-performance, production-grade RESTful service**, providing JSON-formatted data to the Next.js frontend. It features a public-facing API for visitors, an AI chatbot endpoint, and a hardened Admin API for portfolio management.

### Base URL
- **Local Development**: `http://localhost:5000/api`
- **Production**: `https://<your-domain>/api`

### Authentication Architecture (Dual-Token + HttpOnly Cookie)
All Admin API endpoints (prefixed with `/admin`) require authentication:
- **Access Token**: Short-lived (15 minutes). Sent in header: `Authorization: Bearer <access_token>`.
- **Refresh Token**: Long-lived (1 day). Stored and transmitted via bank-grade `HttpOnly; SameSite=Lax; Secure` cookie and/or JSON body.
- **Refresh Token Rotation (RTR)**: Each refresh token is single-use only. When refreshed, the old token JTI is permanently blacklisted in PostgreSQL, and a new token pair is issued.

---

## 🚦 Rate Limiting & Protection Specifications

| Endpoint | Method | Rate Limit | Protection Mechanism |
|---|---|---|---|
| `/admin/login` | `POST` | **5 failed attempts / 5 min lockout** + `10/min` | Brute-force & credential stuffing defense + `hmac.compare_digest` timing attack mitigation |
| `/admin/refresh` | `POST` | **30 per minute** | Token generation spam prevention + Replay attack detection |
| `/admin/upload` | `POST` | **20 per minute** | Bandwidth exhaustion prevention + Strict file extension whitelist |
| `/contact` | `POST` | **5 per minute; 20 per hour** | Anti-spam & inbox protection |
| `/analytics/track` | `POST` | **30 per minute** | Bot analytics spoofing prevention |
| `/analytics/heartbeat` | `POST` | **60 per minute** | Ping spam prevention |
| **Global Default** | `ALL` | **200 per minute; 2000 per hour** | DoS/DDoS protection on all public read endpoints |

---

## 🌎 Public API Endpoints (Read-Only)

### 🏥 System Health
- **Endpoint**: `GET /health`
- **Purpose**: Verify if the backend API and database connection pool are online.
- **Response**: `{"status": "healthy", "message": "Flask backend is running!"}`

### 👤 Profile Information
- **Endpoint**: `GET /personal-info`
- **Purpose**: Retrieve owner's bio, contact details, social links, availability, and timezone.
- **Response**: `PersonalInfo` JSON object.

### 💼 Portfolio Sections
- **Endpoints**:
  - `GET /skills`: Categorized technical skill sets.
  - `GET /projects`: List of all projects (supports query filter `?featured=true`).
  - `GET /experience`: Work history, roles, achievements, and tech stack tags.
  - `GET /education`: Academic degrees, institutions, and dates.
  - `GET /certifications`: Verified licenses, badges, and verification links.
  - `GET /achievements`: Key career milestones and stats.
  - `GET /testimonials`: Professional recommendations and ratings.
  - `GET /blog`: Published articles (supports `?featured=true`).

### 📬 User Interaction
- **Endpoint**: `POST /contact`
- **Rate Limit**: 5 per minute, 20 per hour
- **Payload**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Project Collaboration",
    "message": "Hi, I would like to discuss a project..."
  }
  ```
- **Response**: `{"success": true, "message": "Message sent successfully"}`

### 📈 Visitor Analytics Tracking
- **Endpoint**: `POST /analytics/track`
- **Payload**: `{"visitorId": "UUID", "sessionId": "UUID", "deviceType": "Desktop", "browser": "Chrome", "pagePath": "/"}`
- **Endpoint**: `POST /analytics/heartbeat`
- **Payload**: `{"sessionId": "UUID", "duration": 45}`

---

## 🔒 Admin API Endpoints (Secured)

### 🔑 Authentication & Token Lifecycle

#### 1. Admin Login
- **Endpoint**: `POST /admin/login`
- **Payload**: `{"username": "Admin", "password": "YourPassword"}`
- **Response Headers**: Sets `Set-Cookie: admin_refresh_token=<token>; HttpOnly; SameSite=Lax; Path=/api/admin; Max-Age=86400`
- **Response Body**:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "username": "Admin",
      "email": "admin@portfolio.dev"
    }
  }
  ```

#### 2. Access Token Refresh (RTR)
- **Endpoint**: `POST /admin/refresh`
- **Authentication**: Transmitted automatically via `admin_refresh_token` HttpOnly cookie OR JSON body `{"refreshToken": "..."}`.
- **Behavior**: Rotates refresh token (destroys old JTI in PostgreSQL blocklist, issues fresh 15m access token + new 1d refresh token).
- **Response**: Same structure as login token pair.

#### 3. Admin Logout
- **Endpoint**: `POST /admin/logout`
- **Behavior**: Blacklists both active access token and refresh token in database `revoked_tokens` table; clears `admin_refresh_token` HttpOnly cookie.
- **Response**: `{"success": true, "message": "Successfully logged out and tokens invalidated"}`

#### 4. Verify Session
- **Endpoint**: `GET /admin/verify`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: `{"success": true, "message": "Token valid", "user": {"username": "Admin", "email": "..."}}`

---

### 📂 Content Management (Full CRUD)

All the following endpoints require `Authorization: Bearer <access_token>`:
- `GET`, `POST`, `PUT`, `DELETE`: `/admin/projects`
- `GET`, `POST`, `PUT`, `DELETE`: `/admin/experience`
- `GET`, `POST`, `PUT`, `DELETE`: `/admin/education`
- `GET`, `POST`, `PUT`, `DELETE`: `/admin/certifications`
- `GET`, `POST`, `PUT`, `DELETE`: `/admin/testimonials`
- `GET`, `POST`, `PUT`, `DELETE`: `/admin/blog`
- `GET`, `PUT`: `/admin/personal-info`
- `GET`, `PUT`: `/admin/skills`

---

### 🖼️ Media & File Upload
- **Endpoint**: `POST /admin/upload`
- **Headers**: `Authorization: Bearer <access_token>`
- **Payload**: `multipart/form-data` with `file` key.
- **Allowed Extensions**: `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.pdf` (Enforced for defense-in-depth).
- **Storage Target**:
  - **Production**: Cloudinary CDN (permanent, global CDN).
  - **Local Development**: `backend/static/uploads/`.
- **Response**: `{"success": true, "url": "https://res.cloudinary.com/...", "filename": "unique_id"}`

---

### 💾 Database Backup & Disaster Recovery

#### 1. Export Database Snapshot
- **Endpoint**: `GET /admin/backup`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Downloadable JSON snapshot file with HTTP header:
  `Content-Disposition: attachment; filename=portfolio_backup_YYYYMMDD_HHMMSS.json`

#### 2. Restore Database from Backup
- **Endpoint**: `POST /admin/restore`
- **Headers**: `Authorization: Bearer <access_token>`
- **Payload**: JSON backup body or multipart file upload containing backup JSON.
- **Response**: `{"success": true, "message": "Database restored successfully from backup"}`
