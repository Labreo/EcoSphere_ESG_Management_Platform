# 🌱 EcoSphere ESG Management Platform

EcoSphere is a premium, feature-rich **Environmental, Social, and Governance (ESG)** management and gamification platform designed to help organizations measure, manage, and improve their sustainability metrics. By integrating operational data, policy compliance, employee engagement, and rewards, EcoSphere makes ESG reporting interactive, auditable, and motivating.

---

## 🚀 Key Modules & Capabilities

### 🍃 1. Environmental: Carbon Accounting
- **Auto Emission Calculations:** Automatic emission estimation for operational activities (Fleet, Electricity, Expenses, and Manufacturing) based on database-managed emission factors.
- **Sustainability Goals:** Goal tracking with configurable metrics (e.g., target carbon reductions) and real-time progress calculations.
- **Product ESG Profiles:** Track and manage SKUs, recycling percentages, and water/carbon footprint statistics.
- **Real-Time Dashboards:** Analyze carbon distribution and sustainability trends per department.

### 👥 2. Social: CSR & Diversity
- **CSR Activity Management:** Create, manage, and sign up for CSR events and volunteer opportunities.
- **Employee Participation:** Submit evidence proof files for activity attendance with admin approval workflows.
- **Diversity Metrics:** Access interactive breakdowns of employee headcount, department assignments, and diversity distribution.

### 🛡️ 3. Governance: Compliance & Policies
- **Policy Management:** Version-controlled ESG policies with mandatory acknowledgement tracking for employees.
- **Audit Logging:** Maintain schedules and results of internal and external environmental/compliance audits.
- **Compliance Issues:** Log, assign owners, set due dates, and resolve violations. Overdue issues are automatically flagged for review.

### 🏆 4. Gamification: Engagement Hub
- **Sustainability Challenges:** Interactive tasks with different difficulties (Easy, Medium, Hard) and deadlines.
- **XP & Points:** Earn XP for completing challenges and redeemable Points for participating in CSR events.
- **Badges Catalog:** Unlock special achievements automatically when personal criteria (XP, challenges completed) are met.
- **Rewards Catalog:** Redeem hard-earned points for company incentives (Amazon gift cards, eco-merch packs, extra PTO).
- **Leaderboards:** Real-time gamified rankings for individual employees (XP) and departments (ESG Scores).

### 📊 5. Custom Reports Builder
- Interactive filters by Department, Date Range, Module, Employee, and ESG Category.
- Direct export support for **PDF**, **Excel (XLSX)**, and **CSV** formats.

### 💬 6. EcoBot AI Chatbot
- An interactive ESG Policy Advisor powered by Google Gemini (with offline rule-based fallback).
- Instantly answer user questions about company policies, carbon accounting principles, and scoring rules.

---

## 🛠️ Architecture & Project Structure

The project follows a **Feature-Based / Screaming Architecture** layout, keeping backend modules completely self-contained under their respective directory scopes to minimize developer conflicts.

```text
EcoSphere_ESG_Management_Platform/
├── backend/                  # FastAPI Backend Application
│   ├── app/
│   │   ├── modules/          # Feature-based business logic modules
│   │   │   ├── auth/         # Registrations, Login, Profiles & Department Management
│   │   │   ├── environmental/# Emission factors, transactions, profiles, and goals
│   │   │   ├── social/       # CSR activities, volunteer sign-up, and diversity
│   │   │   ├── governance/   # Policies, acknowledgements, audits, and compliance
│   │   │   ├── gamification/ # Challenges, badges, leaderboards, and rewards
│   │   │   ├── chatbot/      # EcoBot AI chatbot service and session manager
│   │   │   ├── settings/     # System configurations, score weights, and notifications
│   │   │   └── reports/      # PDF/CSV/Excel analytics & report generation
│   │   ├── main.py           # Application Entrypoint
│   │   ├── database.py       # SQLModel engine and seed configurations
│   │   └── config.py         # App environment configurations
│   ├── tests/                # Automated Pytest Suite
│   └── requirements.txt      # Python dependencies
│
└── frontend/                 # Single-Page Application (SPA) Frontend
    ├── css/
    │   └── style.css         # Premium Glassmorphism & Custom Light/Dark Theme CSS
    ├── js/
    │   ├── api/              # Core Axios-free HTTP Fetch APIs
    │   ├── components/       # Reusable SPA Page/Tab Component Injectors
    │   └── app.js            # Frontend Router, Routing Table & Init Logic
    └── index.html            # Main HTML Shell
```

---

## ⚡ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend Framework** | **FastAPI** | Asynchronous Python framework with auto-generated Swagger docs (`/docs`). |
| **ORM / Models** | **SQLModel** | Elegant combination of SQLAlchemy and Pydantic for zero-duplication data schemas. |
| **Database** | **SQLite** | Zero-config SQL engine suitable for hackathons and local development. |
| **AI Integration** | **Google Gemini** | LLM API powering the EcoBot ESG Policy Advisor. |
| **Frontend** | **Vanilla JS & CSS** | Single-page framework-less SPA designed with glassmorphic visuals and fluid transitions. |
| **Icons** | **Lucide Icons** | SVG icon system integrated cleanly within the UI. |

---

## 🔑 Demo Seed Accounts

To log in and immediately explore the platform, use the following pre-seeded credentials:

| Role | Email | Password | Initial State |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ecosphere.com` | `admin123` | Control settings, manage departments, and audit logs. |
| **ESG Manager** | `aditi@ecosphere.com` | `aditi123` | Create goals, log carbon emissions, and manage policies. |
| **Employee** | `employee@ecosphere.com` | `employee123` | Join challenges, sign up for CSR events, and redeem rewards. |
| **Employee (Alt)** | `sarah@ecosphere.com` | `sarah123` | Secondary user for leaderboard competition. |
| **Employee (Alt)** | `karan@ecosphere.com` | `karan123` | Third user for leaderboard competition. |

---

## ⚙️ How to Run Locally

### 1. Run the Backend Server
```bash
# Navigate to the backend directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the uvicorn development server
export PYTHONPATH=.
uvicorn app.main:app --reload --port 8000
```
- **Interactive OpenAPI Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alt ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### 2. Run the Frontend
Since the frontend is built as a static Single-Page Application, you can run a simple local web server in the `frontend` folder or serve it via your IDE extensions (e.g., Live Server).

Using python's built-in HTTP server:
```bash
# Navigate to the frontend directory
cd frontend

# Spin up a lightweight server
python3 -m http.server 3000
```
Then visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📐 Business Logic & Score Formulas

### Overall ESG Score Calculations
The platform computes a **weighted average** of the organization's department scores. Weights are fully configurable under the System Settings page:
- **Default Weights:** Environmental (40%), Social (30%), Governance (30%).
- **Formula:**
  $$\text{Department Total Score} = (\text{Env Score} \times W_{env}) + (\text{Social Score} \times W_{soc}) + (\text{Gov Score} \times W_{gov})$$
  $$\text{Overall ESG Score} = \frac{\sum(\text{Department Total Score})}{\text{Total Departments Count}}$$

### Active Settings Toggles
Admins can customize system behavior in settings:
1. **Auto Emission Calculation:** Automatically calculates CO2e when new transactions are logged.
2. **Evidence Requirement:** Blocks manager approval for CSR events/challenges if proof documents/URLs are missing.
3. **Badge Auto-Award:** Instantly assigns unlocked badges to employees once background checks meet the criteria.

---

## 🧪 Running Backend Tests
Ensure the backend services are running perfectly by running the unit tests:
```bash
cd backend
PYTHONPATH=. ./venv/bin/pytest
```