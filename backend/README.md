# EcoSphere ESG Platform Backend

This is the FastAPI backend repository scaffold for the EcoSphere ESG Management Platform.

## Quick Start

### 1. Setup Virtual Environment and Dependencies
If not already created, run:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Start the Development Server
```bash
source venv/bin/activate
export PYTHONPATH=.
uvicorn app.main:app --reload --port 8000
```
Once started, you can access:
- **Interactive Documentation (Swagger):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative Docs (ReDoc):** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check Endpoint:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

### 3. Running Tests
```bash
source venv/bin/activate
pytest tests/
```

---

## Architecture Layout
Each module is self-contained under `app/modules/`:
*   `auth`: Handles registration, login, departments, and user identity.
*   `settings`: Handles categories, global toggles, and department ESG score aggregations.
*   `environmental`: Carbon accounting, emission factors, sustainability goals, and carbon transactions.
*   `social`: CSR activities and employee participation.
*   `governance`: ESG policies, policy acknowledgements, audits, and compliance issues.
*   `gamification`: Sustainability challenges, badge auto-unlock rules, rewards redemption catalog, and leaderboards.
*   `reports`: Filtering and exporting reports in PDF, CSV, and Excel formats.
