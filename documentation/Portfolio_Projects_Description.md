# Portfolio Projects - Admin Panel Entry Guide

Yeh file mein dono projects ke liye complete details hain jo tum **Admin Panel → Projects Tab** mein add kar sakte ho.

---

## PROJECT 1 - VS Code Portfolio Website

### Basic Info

| Field         | Value                     |
| ------------- | ------------------------- |
| **Name**      | VS Code Portfolio Website |
| **Filename**  | portfolio.config.ts       |
| **Version**   | 2.0.0                     |
| **Status**    | Live                      |
| **Featured**  | Yes ✅                    |
| **Downloads** | 1.2k                      |
| **Stars**     | 48                        |
| **Forks**     | 12                        |

---

### Description (Admin Panel mein yeh paste karo)

```
A fully responsive, VS Code-inspired developer portfolio built with Next.js 14 and Flask REST API. The UI mimics a real code editor - complete with a sidebar, tab bar, terminal section, and syntax-highlighted code blocks. All content (projects, skills, experience, certifications, blog posts) is dynamically loaded from a Flask + PostgreSQL backend and managed through a custom-built admin panel. Features include a Groq-powered AI chatbot (Zentara), analytics tracking, contact form with email integration, resume modal, and smooth Framer Motion animations throughout.
```

---

### Technologies (add these as tags)

```
Next.js 14, React 18, TypeScript, Flask, Python, PostgreSQL, Framer Motion, Groq AI, Llama 3.3, Axios, JWT Auth, Flask-Mail, Flask-CORS, Lucide React, Recharts, Gunicorn
```

---

### Features (add as list items)

```
- VS Code-inspired UI with sidebar, tab bar, and terminal aesthetics
- Dynamic content management via custom Admin Panel
- Groq AI-powered chatbot (Zentara) with real-time portfolio data context
- JWT-secured admin authentication
- Analytics dashboard with visitor tracking
- Contact form with Flask-Mail email integration
- Resume PDF modal viewer
- Framer Motion page transitions and scroll animations
- Fully responsive - mobile, tablet, desktop
- PostgreSQL database with Flask REST API (15+ endpoints)
- Dark theme with custom CSS variables and glassmorphism effects
- SEO optimized with Next.js sitemap and robots.ts
```

---

### Terminal Output (yeh project card ke terminal preview mein dikhega)

```
$ npm run build
> Compiling Next.js 14 app...
> ✔ TypeScript check passed
> ✔ Flask API connected on :5000
> ✔ 15 API endpoints registered
> ✔ Groq AI chatbot initialized
> 🚀 Portfolio deployed successfully!
```

---

### Links

| Field          | Value                            |
| -------------- | -------------------------------- |
| **Demo URL**   | apni live URL yahan daalo        |
| **GitHub URL** | apna GitHub repo URL yahan daalo |

---

---

## PROJECT 2 - Zentara AI Chatbot

### Basic Info

| Field         | Value                            |
| ------------- | -------------------------------- |
| **Name**      | Zentara - AI Portfolio Assistant |
| **Filename**  | zentara.bot.ts                   |
| **Version**   | 1.3.0                            |
| **Status**    | Live                             |
| **Featured**  | Yes ✅                           |
| **Downloads** | 340                              |
| **Stars**     | 31                               |
| **Forks**     | 7                                |

---

### Description - Option A (627 chars, detailed)

```
Zentara is an intelligent AI assistant embedded directly into the portfolio, built to represent the developer and help visitors learn about skills, projects, and availability. It uses Groq's Llama 3.3-70B model via the Next.js API route, fetching live portfolio data from the Flask backend on every request to ensure responses are always accurate and up-to-date. Features include streaming text responses, voice input (Web Speech API), conversation history, smart fallback responses when AI is unavailable, sentiment detection, time-based greetings, copy-to-clipboard, retry on failure, and quick-chip shortcuts. The UI is a custom-built floating chat window with smooth animations, a branded Zentara avatar, and a tooltip popup system.
```

### Description - Option B (500 chars, use this in admin panel)

```
Zentara is a custom AI assistant built into the portfolio using Groq's Llama 3.3-70B model. It fetches live data from the Flask backend on every request, keeping answers always accurate. Supports streaming responses, voice input via Web Speech API, conversation history, sentiment detection, and smart fallback when AI is offline. The floating chat UI features a branded avatar, quick-chip shortcuts, copy-to-clipboard, retry on failure, and time-based greetings - all in under 300 words per reply.
```

---

### Technologies (add these as tags)

```
Next.js 14, TypeScript, Groq SDK, Llama 3.3-70B, React, Web Speech API, Flask REST API, Framer Motion, Lucide React, CSS Animations, Streaming UI
```

---

### Features (add as list items)

```
- Powered by Groq's Llama 3.3-70B-Versatile model
- Live portfolio data fetched from Flask API on every request
- Streaming text response with character-by-character animation
- Smart data-rich fallback when AI is unavailable (no degraded UX)
- Sentiment detection - adapts tone for frustrated or positive users
- Voice input via Web Speech API
- Conversation history (last 6 messages sent as context)
- Quick-chip shortcuts: Projects, Skills, Experience, Hire Me, Contact, AI Work
- Copy message to clipboard
- Retry button on failed responses
- Time-based greeting (Good morning / afternoon / evening)
- Rotating tooltip popup with 5 different messages
- Fully accessible with ARIA labels
- 300 character input limit with live counter
- 15-second request timeout with graceful error handling
```

---

### Terminal Output (project card terminal preview ke liye)

```
$ node zentara.init.js
> Loading Groq SDK...
> ✔ Llama 3.3-70B model connected
> ✔ Portfolio data pipeline active
> ✔ Sentiment engine initialized
> ✔ Voice input module ready
> 🚀 Zentara is online and listening!
```

---

### Links

| Field          | Value                                            |
| -------------- | ------------------------------------------------ |
| **Demo URL**   | apni live portfolio URL daalo (chatbot wahi hai) |
| **GitHub URL** | apna GitHub repo URL daalo                       |

---

## Admin Panel mein Add Karne Ka Tarika

1. Admin Panel kholo → **Projects** tab pe jao
2. **"Add Project"** button click karo
3. Upar diye gaye fields ek-ek karke fill karo
4. Technologies aur Features ke liye **Tag Input** use karo - ek-ek karke add karo
5. Terminal Output lines ko alag-alag lines mein add karo
6. **Save** karo

Dono projects ko **Featured: Yes** mark karna - woh homepage pe highlight honge.
