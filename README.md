# 🌱 EcoSphere ESG Management Platform

EcoSphere is a premium, feature-rich **Environmental, Social, and Governance (ESG)** management and gamification platform designed to help organizations measure, manage, and improve their sustainability metrics. By integrating operational data, policy compliance, employee engagement, and rewards, EcoSphere makes ESG reporting interactive, auditable, and motivating.

Designed with a high-fidelity **glassmorphic UI**, responsive charts, a customized light/dark theme system, and an interactive Gemini-powered AI advisor, EcoSphere provides a state-of-the-art administrative and employee experience.

---

## 🎯 Evaluator Quick-Start Guide

To evaluate this platform as quickly and thoroughly as possible, you can run it locally with pre-seeded, high-fidelity demo data.

### 1. Launch the Backend Server
The backend is powered by FastAPI and SQLModel (SQLite database). It will **automatically seed** all database models (departments, employees, categories, carbon factors, policies, audits, challenges, and notifications) on its first run.

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy the environment template and set your keys (if desired)
cp .env.example .env

# 5. Start the development server
export PYTHONPATH=.
uvicorn app.main:app --reload --port 8000
```
- **Interactive Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alt ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### 2. Launch the Frontend SPA
Since the frontend is built using pure Single-Page Application (SPA) architecture (Vanilla JS/CSS), you can serve it with any lightweight web server.

```bash
# 1. Open a new terminal tab and navigate to the frontend folder
cd frontend

# 2. Start a simple python web server
python3 -m http.server 3000
```
Now, open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Pre-Seeded Demo Accounts

Use the credentials below to log in and instantly see populated dashboards, compliance logs, leaderboards, and historical data:

| Role | Email | Password | What You Can Evaluate |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ecosphere.com` | `admin123` | Control scoring weights, configure system features, manage departments, inspect database tables, and view global audit logs. |
| **ESG Manager** | `aditi@ecosphere.com` | `aditi123` | Log new carbon transactions, configure emission factors, add sustainability goals, audit policies, and approve employee submissions. |
| **Employee** | `employee@ecosphere.com` | `employee123` | Track carbon footprints, review and sign off policies, participate in CSR events, join active challenges, view leaderboards, and redeem rewards. |
| **Employee (Alt)** | `sarah@ecosphere.com` | `sarah123` | Alternative employee account to check competitive leaderboards and points comparisons. |
| **Employee (Alt)** | `karan@ecosphere.com` | `karan123` | Alternative employee account with already completed challenges (+80 XP). |

---

## 🚀 How to Create a Live Website Link (Deployment Guide)

You can host both the frontend and the backend for free. Follow these direct instructions to make your application live.

### Step 1: Deploy the Backend API
You can host the FastAPI backend on **Render** or **Railway**.

#### Option A: Deploy on Render (Recommended & Free)
1. Sign up/Log in at [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   - **Name:** `ecosphere-backend`
   - **Environment:** `Python`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Scroll down to **Environment Variables** and click **Add Environment Variable**:
   - `DATABASE_URL`: `sqlite:///./ecosphere_esg.db` (For a production-grade DB, you can spin up a free PostgreSQL database on Render and paste its connection URI here).
   - `GOOGLE_GEMINI_API_KEY`: *(Your Gemini API key for the AI chatbot)*
   - `BREVO_API_KEY`: *(Your Brevo SMTP key for email notifications)*
   - `CORS_ORIGINS`: `*`
6. Click **Deploy Web Service**. Render will build and provide a live URL, e.g., `https://ecosphere-backend.onrender.com`.

---

### Step 2: Configure the Frontend to Point to the Live API
By default, the frontend code communicates with `localhost:8000`. You need to point the frontend to the deployed backend link.

1. Open `frontend/js/api/client.js` in your editor.
2. At the top of the file, we have implemented a dynamic override check:
   ```javascript
   const API_BASE = localStorage.getItem('API_BASE') || window.API_BASE || 'http://127.0.0.1:8000/api/v1';
   ```
3. To lock it in for your live deployment without manual browser console entry:
   - Option A: Modify that line to hardcode your live Render API URL:
     ```javascript
     const API_BASE = 'https://ecosphere-backend.onrender.com/api/v1';
     ```
   - Option B: Add a script block in the `<head>` of your `frontend/index.html` (before other scripts load) pointing to your backend:
     ```html
     <script>window.API_BASE = 'https://ecosphere-backend.onrender.com/api/v1';</script>
     ```
4. Save the changes and commit/push them to your GitHub repository.

---

### Step 3: Deploy the Frontend Website
Since the frontend is a pure static app, you can host it for free on **GitHub Pages**, **Netlify**, or **Vercel**.

#### Option A: Deploy on GitHub Pages
1. In your GitHub repository, go to **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
3. Select your branch (e.g., `main`) and set the folder to `/ (root)` or `/frontend` depending on repository setup. *(Note: If your repository structure has `/frontend` as a subfolder, GitHub Pages can serve it. However, if your repo root has multiple directories, it is easier to use Netlify or Vercel which allows configuring the base directory).*

#### Option B: Deploy on Netlify (Easiest for subfolders)
1. Sign up/Log in at [Netlify.com](https://netlify.com/).
2. Click **Add new site** -> **Import from Git**.
3. Choose your GitHub repository.
4. Set the following build settings:
   - **Base directory:** `frontend`
   - **Build command:** *(Leave empty)*
   - **Publish directory:** `.` (meaning the root of the `frontend` folder)
5. Click **Deploy Site**.
6. Once deployed, Netlify will generate a live URL (e.g., `https://ecosphere-esg.netlify.app`).

**🎉 Congratulations! Your ESG Management platform is now fully live!**

---

## 🛠️ Project Architecture & Screaming Layout

The project follows a **Feature-Based / Screaming Architecture** layout. Backend business modules are completely self-contained under their respective directories to keep components decoupled and easy to extend:

```text
EcoSphere_ESG_Management_Platform/
├── backend/                  # FastAPI Backend Application
│   ├── app/
│   │   ├── modules/          # Business logic divided by module namespaces
│   │   │   ├── auth/         # Registrations, Login, Profile & Department Management
│   │   │   ├── environmental/# Carbon calculations, transactions, profiles, and goals
│   │   │   ├── social/       # CSR activities, volunteer logs, and diversity statistics
│   │   │   ├── governance/   # Policies, acknowledgements, audits, and compliance issues
│   │   │   ├── gamification/ # Challenges, badges auto-award, XP, and rewards
│   │   │   ├── chatbot/      # EcoBot AI chatbot (Gemini Integration)
│   │   │   ├── settings/     # Scoring weights, category management, configurations
│   │   │   └── reports/      # PDF, Excel, and CSV builders
│   │   ├── main.py           # FastAPI Startup & Router Mounts
│   │   ├── database.py       # SQLModel engine and Seed Configuration
│   │   └── config.py         # Application settings & environment loader
│   ├── tests/                # Automated Pytest Suite
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # Client SPA application
    ├── css/
    │   └── style.css         # Premium Glassmorphic design, scrollbars & animations
    ├── js/
    │   ├── api/              # Module fetch/request services
    │   ├── components/       # Pages & dynamic tab render functions
    │   ├── lib/              # Self-hosted Lucide helper
    │   └── app.js            # SPA client router and event hub
    └── index.html            # Primary single-page HTML layout
```

---

## 🍃 Core Business Logic & Calculations

### 1. Department ESG Scores
A department's total ESG score is calculated from its components using customizable weights set by system admins (Default: E=40%, S=30%, G=30%):

$$\text{Department Score} = (\text{Env Score} \times W_{env}) + (\text{Social Score} \times W_{soc}) + (\text{Gov Score} \times W_{gov})$$

- **Environmental Score:** Based on the completion percentage of goals and the ratio of actual emissions vs targets.
- **Social Score:** Based on employee training course completions and CSR event participation.
- **Governance Score:** Based on the percentage of policies acknowledged and resolved compliance audits.

### 2. Gamification and Engagement
- **Challenges:** Employees join active challenges (Easy, Medium, Hard). Completing a challenge and submitting optional proof awards XP.
- **Auto-Badge Award:** If configured in admin settings, the backend automatically awards badges (like `Eco Warrior` or `Challenge Master`) the moment an employee's profile meets the unlock criteria.
- **Reward Redemptions:** Employees redeem accrued points (gained from volunteer hours and training) for gift cards, merchandise, or PTO. The system automatically updates inventory and deducts points.

---

## 🧪 Testing and Verification

You can run automated tests to verify backend service layers and routers:

```bash
# Navigate to the backend directory
cd backend

# Execute Pytest
PYTHONPATH=. ./venv/bin/pytest
```

All 30+ tests verify endpoints for authentication, emission calculations, custom report builders, and policy acknowledgements.