# 🖥️ Developer Portfolio - Full-Stack

> VS Code-themed developer portfolio - **Next.js 14** frontend + **Flask REST API** backend.  
> Clean monorepo structure with `frontend/` and `backend/` fully separated.

---

## 📁 Folder Structure

```
portfolio-root/
│
├── frontend/                   # ── Next.js 14 App ──────────────────────
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx          # Root layout (fonts, global CSS)
│   │   ├── page.tsx            # Main portfolio page
│   │   ├── error.tsx           # Global error boundary
│   │   ├── providers.tsx       # Client-side context providers
│   │   ├── robots.ts           # Robots.txt generator
│   │   ├── sitemap.ts          # Sitemap generator
│   │   ├── favicon.ico         # Site favicon
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── layout.tsx      # Admin layout wrapper
│   │   │   ├── page.tsx        # Admin dashboard page
│   │   │   └── test-page.tsx   # Admin test/debug page
│   │   └── api/                # Next.js API routes
│   │       └── chat/           # AI chatbot API
│   │           └── route.ts    # Chat route handler
│   │
│   ├── components/             # Reusable React components
│   │   ├── HeroSection.tsx     # Hero / intro section
│   │   ├── SkillsSection.tsx   # Skills display
│   │   ├── ProjectsSection.tsx # Projects showcase
│   │   ├── BlogSection.tsx     # Blog posts section
│   │   ├── ContactSection.tsx  # Contact form
│   │   ├── EducationSection.tsx        # Education history
│   │   ├── CertificationsSection.tsx   # Certifications
│   │   ├── TestimonialsSection.tsx     # Testimonials
│   │   ├── TerminalSection.tsx         # Interactive terminal UI
│   │   ├── ChatBot.tsx                 # AI chatbot widget
│   │   ├── Header.tsx                  # Site header / nav
│   │   ├── Footer.tsx                  # Site footer
│   │   ├── Sidebar.tsx                 # VS Code-style sidebar
│   │   ├── ResizableSidebar.tsx        # Draggable sidebar
│   │   ├── TabBar.tsx                  # VS Code-style tab bar
│   │   ├── AppContainer.tsx            # Main layout container
│   │   ├── AppSkeletons.tsx            # App-level skeleton loaders
│   │   ├── Skeleton.tsx                # Generic skeleton component
│   │   ├── GlobalBackground.tsx        # Animated background
│   │   ├── PreLoader.tsx               # Initial page preloader
│   │   ├── ScrollToTop.tsx             # Scroll-to-top button
│   │   ├── ResumeModal.tsx             # Resume viewer modal
│   │   ├── GitHistory.tsx              # Git history display
│   │   ├── AnalyticsTracker.tsx        # Analytics event tracker
│   │   └── admin/                      # Admin-specific components
│   │       ├── DashboardTab.tsx        # Admin dashboard overview
│   │       ├── PersonalInfoTab.tsx     # Edit personal info
│   │       ├── SkillsTab.tsx           # Manage skills
│   │       ├── ProjectsTab.tsx         # Manage projects
│   │       ├── ExperienceTab.tsx       # Manage experience
│   │       ├── EducationTab.tsx        # Manage education
│   │       ├── CertificationsTab.tsx   # Manage certifications
│   │       ├── AchievementsTab.tsx     # Manage achievements
│   │       ├── TestimonialsTab.tsx     # Manage testimonials
│   │       ├── BlogTab.tsx             # Manage blog posts
│   │       ├── MessagesTab.tsx         # View contact messages
│   │       ├── AnalyticsTab.tsx        # View analytics data
│   │       ├── AdminSkeleton.tsx       # Admin loading skeleton
│   │       ├── Modal.tsx               # Generic modal
│   │       ├── ModalAlert.tsx          # Modal with alert styling
│   │       ├── ConfirmDialog.tsx       # Confirmation dialog
│   │       ├── ErrorAlert.tsx          # Error alert component
│   │       ├── LoadingSpinner.tsx      # Loading spinner
│   │       ├── ToastContainer.tsx      # Toast notification container
│   │       ├── TagInput.tsx            # Tag input field
│   │       └── TagListField.tsx        # Tag list display field
│   │
│   ├── lib/                    # API clients & utilities
│   │   ├── api.ts              # Public portfolio API client
│   │   ├── apiClient.ts        # Base HTTP client wrapper
│   │   ├── admin-api.ts        # Admin API client
│   │   ├── admin-types.ts      # TypeScript interfaces for admin
│   │   ├── toast.ts            # Toast notification helper
│   │   └── validation.ts       # Form validation utilities
│   │
│   ├── styles/                 # Global CSS stylesheets
│   │   ├── globals.css         # Base global styles
│   │   ├── components.css      # Shared component styles
│   │   ├── sections.css        # Portfolio section styles
│   │   ├── sections-extended.css   # Extended section styles
│   │   ├── sections-final.css      # Final section overrides
│   │   ├── skills-modern.css       # Modern skills layout
│   │   ├── responsive.css          # Responsive / mobile styles
│   │   ├── chatbot.css             # Chatbot widget styles
│   │   └── admin.css               # Admin dashboard styles
│   │
│   ├── public/                 # Static assets
│   │   ├── images/             # Image assets
│   │   │   ├── oci-badge.png   # OCI certification badge
│   │   │   └── Zentara-logo.png    # Zentara logo
│   │   └── lottie/             # Lottie / GIF animations
│   │       └── AI Robot.gif    # AI robot animation
│   │
│   ├── .env.local              # Frontend env vars (git-ignored)
│   ├── next.config.js          # Next.js config
│   ├── tsconfig.json           # TypeScript config
│   └── package.json            # npm scripts & dependencies
│
├── backend/                    # ── Flask REST API ──────────────────────
│   ├── app.py                  # Application factory (create_app)
│   ├── run.py                  # Development run entry point
│   ├── wsgi.py                 # WSGI / production entry point
│   ├── config.py               # All config from env vars
│   ├── cache.py                # Caching layer
│   ├── limiter.py              # Rate limiting setup
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Safe template - commit this
│   ├── .env                    # Real secrets - NEVER commit
│   │
│   ├── routes/                 # Flask route blueprints
│   │   ├── api.py              # Public API endpoints
│   │   └── admin.py            # Admin-protected endpoints
│   │
│   ├── models/                 # Data models & DB layer
│   │   ├── database.py         # PostgreSQL data layer (psycopg2)
│   │   ├── admin.py            # Admin model / auth
│   │   └── portfolio_data.py   # Default seed data
│   │
│   ├── static/                 # Flask static file serving
│   │   └── uploads/            # User-uploaded files
│   │
│   └── venv/                   # Virtual environment (git-ignored)
│
├── documentation/              # Project docs
│   ├── API_Reference.md        # Full API endpoint reference
│   ├── Portfolio_Projects_Description.md   # Project descriptions
│   └── Project_Architecture.md # Architecture overview
│
├── .gitignore
├── README.md
├── SETUP_GUIDE.md              # Detailed setup instructions
├── GITHUB_GUIDE.md             # GitHub workflow guide
└── run-project.md              # Quick run guide
```

---

## ⚡ Quick Start - Development

### 1. Clone the repo

```bash
git clone https://github.com/your-username/your-portfolio.git
cd your-portfolio
```

### 2. Set up the Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # already points to http://localhost:5000/api
```

### 3. Set up the Backend

```powershell
# Windows (PowerShell)
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env             # then edit .env with your secrets
cd ..
```

```bash
# macOS / Linux
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env               # then edit .env with your secrets
cd ..
```

> **Database:** PostgreSQL required. Create a local DB first:
>
> ```bash
> psql -U postgres -c "CREATE DATABASE portfolio_dev;"
> ```
>
> Then set `DATABASE_URL=postgresql://postgres:your_password@localhost:5432/portfolio_dev` in `backend/.env`

### 4. Start Both Servers

**Option A - One command (recommended):**

```powershell
cd frontend
npm run dev:all
```

**Option B - Two separate terminals:**

```powershell
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
venv\Scripts\Activate.ps1
python run.py
```

### 5. Open in Browser

| Service     | URL                              |
| ----------- | -------------------------------- |
| Frontend    | http://localhost:3000            |
| Backend API | http://localhost:5000            |
| API Health  | http://localhost:5000/api/health |
| Admin Panel | http://localhost:3000/admin      |

---

## 🔌 API Endpoints

| Method | Endpoint                      | Description                               |
| ------ | ----------------------------- | ----------------------------------------- |
| GET    | `/api/health`                 | Health check                              |
| GET    | `/api/personal-info`          | Personal information                      |
| GET    | `/api/skills`                 | All skills by category                    |
| GET    | `/api/projects`               | All projects                              |
| GET    | `/api/projects?featured=true` | Featured projects only                    |
| GET    | `/api/experience`             | Work experience                           |
| GET    | `/api/education`              | Education history                         |
| GET    | `/api/certifications`         | Certifications                            |
| GET    | `/api/achievements`           | Stats & achievements                      |
| GET    | `/api/testimonials`           | Testimonials                              |
| GET    | `/api/blog`                   | Blog posts                                |
| GET    | `/api/stats`                  | Aggregate portfolio stats                 |
| POST   | `/api/contact`                | Submit contact form                       |
| POST   | `/api/admin/login`            | Admin login (dual JWT + HttpOnly cookie)  |
| POST   | `/api/admin/refresh`          | Rotate access token (RTR + HttpOnly)      |
| POST   | `/api/admin/logout`           | Revoke tokens server-side & delete cookie |
| GET    | `/api/admin/backup`           | Download full DB snapshot (JSON)          |
| POST   | `/api/admin/restore`          | Restore DB from JSON snapshot             |
| GET    | `/api/admin/dashboard`        | Admin dashboard data (JWT)                |

---

## 💾 Database Backup & Disaster Recovery

The project includes an automated backup and disaster recovery utility:

```bash
# In backend/ directory:
python backup.py --export                                # Create snapshot in backend/backups/
python backup.py --list                                  # List existing backups
python backup.py --restore backups/<filename>.json       # 1-second full DB restoration
```

Comprehensive documentation is available in:

- [API Reference & Technical Specification](./documentation/API_Reference.md)
- [Project Architecture & System Specification](./documentation/Project_Architecture.md)
- [Security & Database Backup Operations Manual](./documentation/Security_and_Backup_Guide.md)

---

## 📡 Sample API Usage

```python
# backend/routes/api.py
@api.route("/projects", methods=["GET"])
def get_projects():
    projects = db.get_projects()
    featured_only = request.args.get("featured", "false").lower() == "true"
    if featured_only:
        projects = [p for p in projects if p.get("featured", False)]
    return jsonify(projects)
```

```typescript
// frontend/lib/api.ts - use in any component:
import { portfolioAPI } from "@/lib/api";

const projects = await portfolioAPI.getProjects(/* featured= */ true);
```

---

## 🔐 Environment Variables

### Frontend (`frontend/.env.local`)

| Variable              | Description                | Default                     |
| --------------------- | -------------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Flask backend API base URL | `http://localhost:5000/api` |

### Backend (`backend/.env`)

| Variable              | Description                     | Required |
| --------------------- | ------------------------------- | -------- |
| `DATABASE_URL`        | PostgreSQL connection string    | ✅       |
| `SECRET_KEY`          | Flask session secret            | ✅       |
| `JWT_SECRET_KEY`      | JWT signing key                 | ✅       |
| `FLASK_ENV`           | `development` or `production`   | ✅       |
| `CORS_ORIGINS`        | Comma-separated allowed origins | ✅       |
| `ADMIN_USERNAME`      | Admin panel username            | ✅       |
| `ADMIN_PASSWORD`      | Admin panel password            | ✅       |
| `ADMIN_EMAIL`         | Admin email                     | ✅       |
| `MAIL_SERVER`         | SMTP server                     | ➖       |
| `MAIL_PORT`           | SMTP port (default: 587)        | ➖       |
| `MAIL_USERNAME`       | SMTP username / email           | ➖       |
| `MAIL_PASSWORD`       | SMTP App Password               | ➖       |
| `MAIL_DEFAULT_SENDER` | From address for contact emails | ➖       |

---

## 📜 npm Scripts

Run these from the `frontend/` folder:

| Script                  | Description                                   |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Start Next.js dev server (port 3000)          |
| `npm run build`         | Build Next.js for production                  |
| `npm run start`         | Start Next.js production server               |
| `npm run lint`          | Run ESLint                                    |
| `npm run type-check`    | TypeScript type checking                      |
| `npm run backend:setup` | Install Python backend dependencies           |
| `npm run backend:dev`   | Start Flask dev server (port 5000)            |
| `npm run dev:all`       | Start both servers concurrently (recommended) |

---

## 🏗️ Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Frontend   | Next.js 14 (App Router) |
| UI Library | React 18                |
| Styling    | Vanilla CSS             |
| Animation  | Framer Motion           |
| Icons      | Lucide React            |
| Language   | TypeScript              |
| Backend    | Flask 2.3 (Python)      |
| Auth       | PyJWT                   |
| Email      | Flask-Mail              |
| CORS       | Flask-CORS              |
| Database   | PostgreSQL (psycopg2)   |
| Server     | Gunicorn (production)   |

---

## 📄 License

MIT
