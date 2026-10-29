# 🚀 Project Run Guide

Is project ko successfully run karne ke liye niche diye gaye steps follow karein.

## 🛠️ Prerequisites

- **Node.js**: v18 or above
- **Python**: recommended **Python 3.11** (project expects 3.11)
- **PowerShell**: Windows terminal
- **PostgreSQL**: local database required for backend if you want full functionality

---

## ⚡ Quick Start (Recommended)

Agar aapne setup pehle se kar liya hai, toh frontend folder se dono servers ek saath start kar sakte hain:

```powershell
cd frontend
npm run dev:all
```

Yeh command Next.js aur Flask backend dono ko ek saath start kar degi.

---

## 📂 Step-by-Step Setup

### 1️⃣ Backend Setup

Open PowerShell in the project root and run:

```powershell
cd G:\vs-code_protfolio-main\backend
```

#### Create virtual environment

```powershell
py -3.11 -m venv venv
```

#### Activate virtual environment

```powershell
.\venv\Scripts\Activate
```

Agar PowerShell activation block ho jaaye toh:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\venv\Scripts\Activate
```

#### Install backend dependencies

```powershell
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
```

> Agar `psycopg2` ya `psycopg2-binary` install mein error aaye toh Python version check karein. Is project ke liye **Python 3.11** best hai.

#### Create environment file

```powershell
Copy-Item .env.example .env
```

Ab [backend/.env](backend/.env) file ko open karke database credentials update karein:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/portfolio_dev
```

Agar PostgreSQL local machine par install hai, toh:

- PostgreSQL service start karein
- `postgres` user ka password set karein
- `portfolio_dev` database create karein

#### Start backend

```powershell
python run.py
```

Backend yahan run hoga:

```text
http://localhost:5000
```

---

### 2️⃣ Frontend Setup

Naya terminal open karein aur frontend folder mein jayein:

```powershell
cd G:\vs-code_protfolio-main\frontend
```

#### Install frontend dependencies

```powershell
npm install
```

#### Start frontend in development mode

```powershell
npm run dev
```

Frontend yahan open hoga:

```text
http://localhost:3000
```

---

## 🧪 Production Build

Agar aap production build test karna chahte hain:

```powershell
cd G:\vs-code_protfolio-main\frontend
npm run build
npm run start
```

> `npm run start` kaam karega sirf tab jab `npm run build` successfully complete ho chuka ho.

---

## 📝 Environment Files

Project ko start karne se pehle ye files ready honi chahiye:

- **Backend**: [backend/.env](backend/.env)
- **Frontend**: [frontend/.env.local](frontend/.env.local)

Agar frontend env file missing ho toh create karke required values add karein.

---

## 🔐 Admin Panel Access

Agar backend aur frontend dono chal rahe hain, toh admin panel open karein:

- **URL:** `http://localhost:3000/admin`
- **Username:** `Admin`
- **Password:** `Admin@12345!`

> Production mein jaane se pehle in credentials ko zaroor change kar dein.

---

## 🔧 Common Issues & Fixes

### 1. `npm` command not working

PowerShell policy ke wajah se error aa sakta hai:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Ya phir temporary fix ke liye:

```powershell
npm.cmd run dev
```

### 2. `next start` shows `BUILD_ID` error

Iska matlab hai aapne build kiye bina production server start kar diya hai:

```powershell
npm run build
npm run start
```

### 3. Backend says `ModuleNotFoundError: No module named 'flask'`

Virtual environment activate karein aur dependencies install karein:

```powershell
cd G:\vs-code_protfolio-main\backend
.\venv\Scripts\Activate
python -m pip install -r requirements.txt
```

### 4. Backend database connection error

Yeh aam tor par `.env` file mein wrong password ya missing database ke wajah se hota hai.

Check karein:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/portfolio_dev
```

Aur ensure karein:

- PostgreSQL service running hai
- password sahi hai
- `portfolio_dev` database exist karti hai

### 5. `psycopg2` install fails

Iska reason aksar **Python version** hota hai. Project ke liye recommended version hai:

```powershell
py -3.11 --version
```

Agar 3.11 install nahi hai toh install karke phir se venv create karein.

---

## 📜 Available NPM Scripts

Frontend folder se ye commands run karein:

| Command                 | Description                                               |
| :---------------------- | :-------------------------------------------------------- |
| `npm run dev:all`       | Frontend + Backend dono start karein                      |
| `npm run dev`           | Sirf frontend start karein                                |
| `npm run backend:dev`   | Sirf backend start karein                                 |
| `npm run backend:setup` | Backend virtual environment aur dependencies setup karein |

---

Happy Coding! 🚀
