# Security & Database Backup Operations Manual

## 1. 🛡️ Cybersecurity Architecture & Threat Model

This application has been engineered to withstand common web application vulnerabilities (OWASP Top 10) through multi-layer defensive depth.

### Threat Defense Matrix

| OWASP Vulnerability | Attack Vector | Implemented Defense Mechanism | Verification Status |
|---|---|---|---|
| **A01: Broken Access Control** | Accessing `/api/admin/*` without credentials or with an expired token | `@admin_required` decorator validates signature, `type: "access"`, issuer, audience, and PostgreSQL JTI blacklist. | Verified (HTTP 401) |
| **A02: Cryptographic Failures** | Token tampering, `"alg": "none"`, key cracking | `HS256` strictly enforced; 64-char high-entropy cryptographic keys; production check rejects secrets `< 32` characters. | Verified (Blocked) |
| **A03: Injection (SQLi)** | SQL injection via form inputs or queries | All queries in `models/database.py` use parameterized tuples (`%s`, tuple), completely separating SQL code from user data. | Verified (Immune) |
| **A04: Insecure Design** | Unlimited login attempts; long-lived stolen tokens | 15-minute access token limit; Refresh Token Rotation (RTR); 5-attempt brute-force lockout window. | Verified (HTTP 429) |
| **A05: Security Misconfiguration** | Verbose error stack traces, missing security headers | Global error handlers return sanitized JSON; middleware adds HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`. | Verified (Active) |
| **A06: Vulnerable Components** | Outdated or exploited packages | Pinned, stable dependencies in `requirements.txt` and `package.json`; strict TypeScript checks. | Verified |
| **A07: Identification & Auth Failures** | Timing attacks, credential guessing | `hmac.compare_digest` prevents side-channel timing analysis; passwords hashed with bcrypt via Werkzeug. | Verified |
| **A08: Software & Data Integrity** | Stolen refresh token replay | Automatic reuse detection: consuming an already-revoked refresh token triggers an alert and blocks all sessions. | Verified (Alert Logged) |
| **A09: Logging & Monitoring Failures** | Undetected unauthorized activity | Critical security logs for invalid tokens, lockout events, and token reuse attacks with client IP tracking. | Verified |
| **A10: SSRF / Malicious Uploads** | Uploading `.svg` with `<script>` tags or executable scripts | `upload_file` enforces strict file extension whitelist (`png, jpg, jpeg, webp, gif, pdf`). | Verified (HTTP 400) |

---

## 2. 🍪 HttpOnly Cookie & Dual-Token Flow

```
User enters credentials
         │
         ▼
[POST /api/admin/login]
         │
         ├── Returns Access Token (15 mins) in JSON response
         └── Sets "admin_refresh_token" (1 day) in HttpOnly; SameSite=Lax; Secure Cookie
         │
         ▼
Admin interacts with Dashboard using Access Token (Bearer Header)
         │
         ▼ (After 15 minutes: Access Token expires)
Next API request returns HTTP 401 Unauthorized
         │
         ▼
Frontend Axios/Fetch Interceptor automatically catches 401:
         │
         ├── Sends [POST /api/admin/refresh] with HttpOnly Cookie (credentials: 'include')
         ├── Backend invalidates old Refresh Token in PostgreSQL (RTR)
         ├── Backend sets NEW rotated Refresh Token in HttpOnly Cookie
         └── Backend returns NEW 15-minute Access Token
         │
         ▼
Interceptor seamlessly retries the original request with new token!
(User experiences ZERO interruption or logout prompts!)
```

---

## 3. 💾 Database Backup & Disaster Recovery Operations

### CLI Tool: `backend/backup.py`

The CLI tool connects directly to PostgreSQL using `DATABASE_URL` from your `.env` file.

#### 1. Create a Snapshot Backup:
```bash
# In backend directory:
python backup.py --export
```
- Exports all tables (`personal_info`, `skills`, `projects`, `experience`, `education`, `certifications`, `achievements`, `testimonials`, `blog_posts`, `contact_messages`).
- Saves timestamped JSON file to `backend/backups/portfolio_backup_YYYYMMDD_HHMMSS.json`.

#### 2. View Available Backups:
```bash
python backup.py --list
```
Output:
```
Available Backups (1 found in backend/backups):
  * portfolio_backup_20261017_223708.json (3.4 KB, modified: 2026-10-17 22:37:08)
```

#### 3. Restore from Backup:
```bash
python backup.py --restore backups/portfolio_backup_20261017_223708.json
```
- Empties current tables.
- Inserts backup records in a single atomic transaction (`conn.commit()`).
- Automatically resets PostgreSQL `SERIAL` sequences (`setval`) so future inserts start at the correct ID.

---

### Admin API 1-Click Web Backup & Restore

#### 1. Download Backup via Browser / API:
- **Request**: `GET /api/admin/backup`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Triggers browser file download `portfolio_backup_<timestamp>.json`.

#### 2. Restore via API:
- **Request**: `POST /api/admin/restore`
- **Headers**: `Authorization: Bearer <access_token>`
- **Body**: Attach backup JSON or send as JSON payload.
- **Response**: `{"success": true, "message": "Database restored successfully from backup"}`

---

### Cloud Hosting Automated Backups

When hosting PostgreSQL in production:
- Standard Cloud Snapshots: Enable daily automated snapshots or volume backups on your host provider.
- Point-in-Time Recovery: Modern managed PostgreSQL databases allow rolling back the database to any chosen minute.

---

## 4. 🚀 Pre-Deployment Security Checklist

Before deploying to production:

1. [ ] **Set Random Production Secrets**:
   ```bash
   python -c "import secrets; print('JWT_SECRET_KEY=' + secrets.token_hex(32))"
   python -c "import secrets; print('SECRET_KEY=' + secrets.token_hex(32))"
   ```
2. [ ] **Configure Allowed Origins**:
   Set `CORS_ORIGINS=https://your-portfolio-domain.com` in backend production environment variables.
3. [ ] **Set Production Admin Credentials**:
   Change `ADMIN_PASSWORD` in production environment to a strong, unique passphrase.
4. [ ] **Verify Cloudinary Storage**:
   Set `CLOUDINARY_URL=cloudinary://...` so uploaded media persists permanently on CDN.
5. [ ] **Run Gunicorn with Threads**:
   ```bash
   gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120
   ```
