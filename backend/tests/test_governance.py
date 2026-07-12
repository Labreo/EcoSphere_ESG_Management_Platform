import sys
import os
from datetime import date, timedelta
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import all models to register in metadata
from app.modules.auth.models import Department, Employee
from app.modules.settings.models import Category, DepartmentScore, SystemConfiguration, Notification
from app.modules.environmental.models import EmissionFactor, ProductESGProfile, EnvironmentalGoal, CarbonTransaction
from app.modules.social.models import CSRActivity, EmployeeParticipation
from app.modules.governance.models import ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue
from app.modules.gamification.models import Badge, Reward, Challenge, ChallengeParticipation, BadgeUnlock, RewardRedemption

import tempfile
_db_fd, _db_path = tempfile.mkstemp(suffix=".db")
import os
os.close(_db_fd)
from sqlmodel import create_engine
engine = create_engine(f"sqlite:///{_db_path}", connect_args={"check_same_thread": False})

def override_get_session():
    with Session(engine) as session:
        yield session

from app.main import app
from app.database import init_db, get_session
from sqlmodel import Session, SQLModel

client = TestClient(app)

def setup_module():
    SQLModel.metadata.create_all(engine)
    app.dependency_overrides[get_session] = override_get_session

def teardown_module():
    SQLModel.metadata.drop_all(engine)
    app.dependency_overrides.clear()
    try:
        os.unlink(_db_path)
    except Exception:
        pass


def _create_policy(session: Session, title="Test Policy", status="Draft"):
    from app.modules.governance.models import ESGPolicy
    policy = ESGPolicy(title=title, description="Desc", version="1.0", effective_date=date.today(), status=status)
    session.add(policy)
    session.commit()
    session.refresh(policy)
    return policy


def _create_audit(session: Session, title="Test Audit", status="Scheduled"):
    from app.modules.governance.models import Audit
    audit = Audit(title=title, auditor="Tester", audit_date=date.today(), status=status)
    session.add(audit)
    session.commit()
    session.refresh(audit)
    return audit


def _create_issue(session: Session, title="Test Issue", due_offset=7, owner_id=1, status="Open"):
    from app.modules.governance.models import ComplianceIssue
    issue = ComplianceIssue(
        title=title, description="Desc", severity="Medium",
        owner_id=owner_id, due_date=date.today() + timedelta(days=due_offset), status=status,
    )
    session.add(issue)
    session.commit()
    session.refresh(issue)
    return issue


# ──────────────────────────────────────────────
#  Policy Tests
# ──────────────────────────────────────────────

class TestPolicies:
    def test_create_policy(self):
        resp = client.post("/api/v1/governance/policies", json={
            "title": "Environmental Policy",
            "description": "Company environmental policy",
            "version": "1.0",
            "effective_date": "2025-01-01",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Environmental Policy"
        assert data["status"] == "Draft"
        assert data["id"] is not None

    def test_list_policies(self):
        resp = client.get("/api/v1/governance/policies")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_policy(self):
        resp = client.get("/api/v1/governance/policies/1")
        assert resp.status_code == 200
        assert resp.json()["id"] == 1

    def test_get_policy_not_found(self):
        resp = client.get("/api/v1/governance/policies/999")
        assert resp.status_code == 404

    def test_update_policy(self):
        resp = client.put("/api/v1/governance/policies/1", json={"status": "Active"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "Active"

    def test_delete_policy(self):
        resp = client.delete("/api/v1/governance/policies/1")
        assert resp.status_code == 204

    def test_delete_policy_not_found(self):
        resp = client.delete("/api/v1/governance/policies/999")
        assert resp.status_code == 404


# ──────────────────────────────────────────────
#  Policy Acknowledgement Tests
# ──────────────────────────────────────────────

class TestAcknowledgement:
    def test_acknowledge_policy(self):
        with Session(engine) as session:
            policy = _create_policy(session)

        resp = client.post(f"/api/v1/governance/policies/{policy.id}/acknowledge",
                           params={"employee_id": 1})
        assert resp.status_code == 200
        data = resp.json()
        assert data["policy_id"] == policy.id
        assert data["employee_id"] == 1
        assert data["acknowledged_at"] is not None

    def test_acknowledge_nonexistent_policy(self):
        resp = client.post("/api/v1/governance/policies/999/acknowledge",
                           params={"employee_id": 1})
        assert resp.status_code == 404


# ──────────────────────────────────────────────
#  Audit Tests
# ──────────────────────────────────────────────

class TestAudits:
    def test_create_audit(self):
        resp = client.post("/api/v1/governance/audits", json={
            "title": "Q1 ESG Audit",
            "auditor": "John Doe",
            "audit_date": "2025-03-15",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Q1 ESG Audit"
        assert data["status"] == "Scheduled"
        assert data["id"] is not None

    def test_list_audits(self):
        resp = client.get("/api/v1/governance/audits")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_audit(self):
        resp = client.get("/api/v1/governance/audits/1")
        assert resp.status_code == 200
        assert resp.json()["id"] == 1

    def test_get_audit_not_found(self):
        resp = client.get("/api/v1/governance/audits/999")
        assert resp.status_code == 404

    def test_update_audit(self):
        resp = client.put("/api/v1/governance/audits/1", json={"status": "In Progress"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "In Progress"

    def test_delete_audit(self):
        resp = client.delete("/api/v1/governance/audits/1")
        assert resp.status_code == 204

    def test_delete_audit_not_found(self):
        resp = client.delete("/api/v1/governance/audits/999")
        assert resp.status_code == 404


# ──────────────────────────────────────────────
#  Compliance Issue Tests
# ──────────────────────────────────────────────

class TestComplianceIssues:
    def test_create_issue(self):
        resp = client.post("/api/v1/governance/issues", json={
            "title": "Data privacy concern",
            "description": "Customer data not encrypted",
            "severity": "High",
            "owner_id": 1,
            "due_date": str(date.today() + timedelta(days=30)),
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Data privacy concern"
        assert data["status"] == "Open"
        assert data["owner_id"] == 1
        assert data["id"] is not None

    def test_list_issues(self):
        resp = client.get("/api/v1/governance/issues")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_issue(self):
        resp = client.get("/api/v1/governance/issues/1")
        assert resp.status_code == 200
        assert resp.json()["id"] == 1

    def test_get_issue_not_found(self):
        resp = client.get("/api/v1/governance/issues/999")
        assert resp.status_code == 404

    def test_update_issue(self):
        resp = client.put("/api/v1/governance/issues/1", json={"status": "Resolved"})
        assert resp.status_code == 200
        assert resp.json()["status"] == "Resolved"

    def test_delete_issue(self):
        resp = client.delete("/api/v1/governance/issues/1")
        assert resp.status_code == 204

    def test_delete_issue_not_found(self):
        resp = client.delete("/api/v1/governance/issues/999")
        assert resp.status_code == 404


# ──────────────────────────────────────────────
#  Overdue Check Tests
# ──────────────────────────────────────────────

class TestOverdueCheck:
    def test_overdue_check_marks_overdue_and_creates_notifications(self):
        with Session(engine) as session:
            issue = _create_issue(session, title="Past due issue", due_offset=-5, owner_id=1, status="Open")

        resp = client.post("/api/v1/governance/issues/check-overdue")
        assert resp.status_code == 200
        notifications = resp.json()
        assert len(notifications) >= 1
        assert notifications[0]["notification_type"] == "Alert"
        assert "Overdue" in notifications[0]["title"]

        with Session(engine) as session:
            from app.modules.governance.models import ComplianceIssue
            updated = session.get(ComplianceIssue, issue.id)
            assert updated.status == "Overdue"
