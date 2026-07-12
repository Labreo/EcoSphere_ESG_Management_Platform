import sys
import os
import tempfile
from datetime import date
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import all models to register in metadata
from app.modules.auth.models import Department, Employee
from app.modules.settings.models import Category, DepartmentScore, SystemConfiguration, Notification
from app.modules.environmental.models import EmissionFactor, ProductESGProfile, EnvironmentalGoal, CarbonTransaction
from app.modules.social.models import CSRActivity, EmployeeParticipation
from app.modules.governance.models import ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue
from app.modules.gamification.models import Badge, Reward, Challenge, ChallengeParticipation, BadgeUnlock, RewardRedemption

from app.database import get_session
from app.main import app

# Use a temporary file-based database for complete test isolation
_db_fd, _db_path = tempfile.mkstemp(suffix=".db")
os.close(_db_fd)
test_engine = create_engine(f"sqlite:///{_db_path}", connect_args={"check_same_thread": False})

def override_get_session():
    with Session(test_engine) as session:
        yield session

client = TestClient(app)

def setup_module():
    SQLModel.metadata.create_all(test_engine)
    app.dependency_overrides[get_session] = override_get_session


def _create_factor(payload: dict) -> dict:
    resp = client.post("/api/v1/environmental/factors", json=payload)
    assert resp.status_code == 201
    return resp.json()


# ── Emission Factors ─────────────────────────────────────────

class TestEmissionFactors:
    def test_create_factor(self):
        resp = client.post("/api/v1/environmental/factors", json={
            "activity_type": "Electricity",
            "factor_value": 0.5,
            "unit": "kWh",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["activity_type"] == "Electricity"
        assert data["factor_value"] == 0.5
        assert data["unit"] == "kWh"
        assert data["status"] == "Active"
        assert "id" in data

    def test_get_factor(self):
        f = _create_factor({"activity_type": "Gas", "factor_value": 2.0, "unit": "m3"})
        resp = client.get(f"/api/v1/environmental/factors/{f['id']}")
        assert resp.status_code == 200
        assert resp.json()["activity_type"] == "Gas"

    def test_get_factor_not_found(self):
        resp = client.get("/api/v1/environmental/factors/99999")
        assert resp.status_code == 404

    def test_update_factor(self):
        f = _create_factor({"activity_type": "Gas", "factor_value": 1.0, "unit": "m3"})
        resp = client.put(f"/api/v1/environmental/factors/{f['id']}", json={
            "factor_value": 2.5,
        })
        assert resp.status_code == 200
        assert resp.json()["factor_value"] == 2.5

    def test_delete_factor_soft(self):
        f = _create_factor({"activity_type": "Water", "factor_value": 0.1, "unit": "liter"})
        resp = client.delete(f"/api/v1/environmental/factors/{f['id']}")
        assert resp.status_code == 204
        fetched = client.get(f"/api/v1/environmental/factors/{f['id']}").json()
        assert fetched["status"] == "Inactive"

    def test_list_factors(self):
        resp = client.get("/api/v1/environmental/factors")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_factors_filter_active(self):
        resp = client.get("/api/v1/environmental/factors?status=Active")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ── Product ESG Profiles ────────────────────────────────────

class TestProductProfiles:
    def test_create_product(self):
        resp = client.post("/api/v1/environmental/products", json={
            "product_name": "Eco Widget",
            "product_sku": "EW-001",
            "carbon_footprint_kg": 10.5,
            "recyclability_percentage": 80.0,
            "water_footprint_liters": 5.0,
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["product_name"] == "Eco Widget"
        assert data["product_sku"] == "EW-001"

    def test_get_product(self):
        resp = client.post("/api/v1/environmental/products", json={
            "product_name": "Green Thing", "product_sku": "GT-001",
        })
        pid = resp.json()["id"]
        resp = client.get(f"/api/v1/environmental/products/{pid}")
        assert resp.status_code == 200
        assert resp.json()["product_name"] == "Green Thing"

    def test_delete_product_soft(self):
        resp = client.post("/api/v1/environmental/products", json={
            "product_name": "B", "product_sku": "B-001",
        })
        pid = resp.json()["id"]
        client.delete(f"/api/v1/environmental/products/{pid}")
        fetched = client.get(f"/api/v1/environmental/products/{pid}").json()
        assert fetched["status"] == "Inactive"

    def test_list_products(self):
        resp = client.get("/api/v1/environmental/products")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ── Environmental Goals ─────────────────────────────────────

class TestEnvironmentalGoals:
    def test_create_goal(self):
        resp = client.post("/api/v1/environmental/goals", json={
            "title": "Reduce emissions by 20%",
            "target_emission_reduction": 10000.0,
            "target_date": "2026-12-31",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Reduce emissions by 20%"
        assert data["current_progress"] == 0.0
        assert data["status"] == "Active"

    def test_delete_goal_soft(self):
        resp = client.post("/api/v1/environmental/goals", json={
            "title": "Test", "target_emission_reduction": 5000, "target_date": "2026-12-31",
        })
        gid = resp.json()["id"]
        client.delete(f"/api/v1/environmental/goals/{gid}")
        fetched = client.get(f"/api/v1/environmental/goals/{gid}").json()
        assert fetched["status"] == "Missed"

    def test_list_goals(self):
        resp = client.get("/api/v1/environmental/goals")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


# ── Carbon Transactions (Auto Emission Calculation) ────────

class TestCarbonTransactions:
    def test_log_transaction_with_auto_calc(self):
        f = _create_factor({"activity_type": "Electricity", "factor_value": 0.5, "unit": "kWh"})
        resp = client.post("/api/v1/environmental/transactions", json={
            "source_type": "Purchase",
            "source_id": "ERP-001",
            "raw_value": 1000,
            "emission_factor_id": f["id"],
            "department_id": 1,
            "transaction_date": "2026-06-15",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["calculated_emissions_kg"] == 500.0  # 0.5 * 1000
        assert data["source_type"] == "Purchase"
        assert data["raw_value"] == 1000

    def test_log_transaction_stores_correct_values(self):
        f = _create_factor({"activity_type": "Travel", "factor_value": 2.0, "unit": "km"})
        resp = client.post("/api/v1/environmental/transactions", json={
            "source_type": "Fleet",
            "source_id": "FLT-001",
            "raw_value": 150,
            "emission_factor_id": f["id"],
            "department_id": 1,
            "transaction_date": "2026-06-15",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["calculated_emissions_kg"] == 300.0  # 2.0 * 150


# ── Dashboard ──────────────────────────────────────────────

class TestDashboard:
    def test_dashboard_returns_aggregated_data(self):
        f = _create_factor({"activity_type": "Electricity", "factor_value": 0.5, "unit": "kWh"})
        dept_id = 9999
        client.post("/api/v1/environmental/transactions", json={
            "source_type": "Purchase", "source_id": "1",
            "raw_value": 100, "emission_factor_id": f["id"],
            "department_id": dept_id, "transaction_date": "2026-06-15",
        })
        client.post("/api/v1/environmental/transactions", json={
            "source_type": "Purchase", "source_id": "2",
            "raw_value": 200, "emission_factor_id": f["id"],
            "department_id": dept_id, "transaction_date": "2026-06-20",
        })
        resp = client.get(f"/api/v1/environmental/dashboard?department_id={dept_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_emissions_kg"] == 150.0  # (0.5*100) + (0.5*200)
        assert len(data["items"]) == 1


def teardown_module():
    app.dependency_overrides.clear()
    try:
        os.close(_db_fd)
        os.unlink(_db_path)
    except Exception:
        pass
