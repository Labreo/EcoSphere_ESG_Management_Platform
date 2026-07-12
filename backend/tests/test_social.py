import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import date, timedelta
from fastapi.testclient import TestClient

# Import all models to register in metadata
from app.modules.auth.models import Department, Employee
from app.modules.settings.models import Category, DepartmentScore, SystemConfiguration, Notification
from app.modules.environmental.models import EmissionFactor, ProductESGProfile, EnvironmentalGoal, CarbonTransaction
from app.modules.social.models import CSRActivity, EmployeeParticipation
from app.modules.governance.models import ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue
from app.modules.gamification.models import Badge, Reward, Challenge, ChallengeParticipation, BadgeUnlock, RewardRedemption

from app.main import app
from app.database import get_session
from sqlmodel import Session, SQLModel, create_engine
from app.modules.auth.service import hash_password, create_access_token

TEST_DB_URL = "sqlite:///./test_ecosphere.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})

def override_get_session():
    with Session(test_engine) as session:
        yield session

client = TestClient(app)

def setup_module():
    app.dependency_overrides[get_session] = override_get_session


def _create_admin(session):
    dept = Department(name="Admin Dept", code="ADMIN")
    session.add(dept)
    session.commit()
    session.refresh(dept)
    emp = Employee(
        name="Admin User",
        email="admin@test.com",
        password_hash=hash_password("password"),
        role="Admin",
        department_id=dept.id,
        gender="Male",
    )
    session.add(emp)
    session.commit()
    session.refresh(emp)
    return emp


def _create_employee(session, dept_id, email, gender="Female"):
    emp = Employee(
        name=email.split("@")[0],
        email=email,
        password_hash=hash_password("password"),
        role="Employee",
        department_id=dept_id,
        gender=gender,
    )
    session.add(emp)
    session.commit()
    session.refresh(emp)
    return emp


def _create_category(session):
    cat = Category(name="Community Service", type="CSR Activity")
    session.add(cat)
    session.commit()
    session.refresh(cat)
    return cat


def _create_activity(session, category_id, **kwargs):
    data = dict(
        title="Beach Cleanup",
        description="Clean the local beach",
        category_id=category_id,
        date=date.today() + timedelta(days=7),
        points_reward=100,
        max_participants=50,
        status="Upcoming",
    )
    data.update(kwargs)
    activity = CSRActivity(**data)
    session.add(activity)
    session.commit()
    session.refresh(activity)
    return activity


def _ensure_config(session):
    config = session.get(SystemConfiguration, 1)
    if not config:
        config = SystemConfiguration(id=1)
        session.add(config)
        session.commit()


def _auth_header(employee):
    token = create_access_token(data={"sub": employee.email})
    return {"Authorization": f"Bearer {token}"}


class TestSocialModule:
    @classmethod
    def setup_class(cls):
        SQLModel.metadata.drop_all(test_engine)
        SQLModel.metadata.create_all(test_engine)
        with Session(test_engine) as session:
            cls.admin = _create_admin(session)
            _ensure_config(session)
            dept_eng = Department(name="Engineering", code="ENG")
            session.add(dept_eng)
            session.commit()
            # Store IDs, not ORM objects, to avoid detached instance issues
            cls.dept_eng_id = dept_eng.id
            dept_mkt = Department(name="Marketing", code="MKT")
            session.add(dept_mkt)
            session.commit()
            cls.dept_mkt_id = dept_mkt.id
            cat = _create_category(session)
            cls.category_id = cat.id
            activity = _create_activity(session, cls.category_id)
            cls.activity_id = activity.id
            # Re-fetch admin to get fresh data
            cls.admin_id = cls.admin.id
            cls.admin_email = cls.admin.email

    @classmethod
    def teardown_class(cls):
        SQLModel.metadata.drop_all(test_engine)

    def _get_admin_header(self):
        token = create_access_token(data={"sub": self.admin_email})
        return {"Authorization": f"Bearer {token}"}

    # ── Activity CRUD ──

    def test_list_activities(self):
        response = client.get("/api/v1/social/activities")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

    def test_create_activity(self):
        payload = {
            "title": "Tree Planting",
            "description": "Plant 100 trees",
            "category_id": self.category_id,
            "date": str(date.today() + timedelta(days=14)),
            "points_reward": 200,
            "max_participants": 30,
        }
        response = client.post(
            "/api/v1/social/activities",
            json=payload,
            headers=self._get_admin_header(),
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Tree Planting"
        assert data["points_reward"] == 200

    def test_get_activity(self):
        response = client.get(f"/api/v1/social/activities/{self.activity_id}")
        assert response.status_code == 200
        assert response.json()["title"] == "Beach Cleanup"

    def test_get_activity_not_found(self):
        response = client.get("/api/v1/social/activities/99999")
        assert response.status_code == 404

    def test_update_activity(self):
        response = client.put(
            f"/api/v1/social/activities/{self.activity_id}",
            json={"title": "Beach Cleanup v2"},
            headers=self._get_admin_header(),
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Beach Cleanup v2"
        # Reset title
        with Session(test_engine) as s:
            act = s.get(CSRActivity, self.activity_id)
            act.title = "Beach Cleanup"
            s.add(act)
            s.commit()

    def test_delete_activity(self):
        with Session(test_engine) as s:
            act = _create_activity(s, self.category_id, title="To Delete")
            act_id = act.id
        response = client.delete(
            f"/api/v1/social/activities/{act_id}",
            headers=self._get_admin_header(),
        )
        assert response.status_code == 204
        with Session(test_engine) as s:
            deleted = s.get(CSRActivity, act_id)
            assert deleted.status == "Cancelled"

    # ── Join Activity ──

    def _create_emp_and_join(self, email, activity_id=None):
        with Session(test_engine) as s:
            emp = _create_employee(s, self.dept_eng_id, email)
            emp_email = emp.email
        aid = activity_id or self.activity_id
        header = _auth_header(emp)
        return emp_email, aid, header

    def test_join_activity(self):
        with Session(test_engine) as s:
            emp = _create_employee(s, self.dept_eng_id, "join1@test.com")
            emp_id = emp.id
            h = _auth_header(emp)
        response = client.post(
            f"/api/v1/social/activities/{self.activity_id}/join",
            headers=h,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["employee_id"] == emp_id
        assert data["activity_id"] == self.activity_id
        assert data["approval_status"] == "Pending"

    def test_join_activity_not_found(self):
        with Session(test_engine) as s:
            emp = _create_employee(s, self.dept_eng_id, "join404@test.com")
            h = _auth_header(emp)
        response = client.post(
            "/api/v1/social/activities/99999/join",
            headers=h,
        )
        assert response.status_code == 404

    def test_join_activity_already_joined(self):
        with Session(test_engine) as s:
            emp = _create_employee(s, self.dept_eng_id, "join409@test.com")
            h = _auth_header(emp)
        client.post(
            f"/api/v1/social/activities/{self.activity_id}/join",
            headers=h,
        )
        response = client.post(
            f"/api/v1/social/activities/{self.activity_id}/join",
            headers=h,
        )
        assert response.status_code == 409

    def test_join_activity_at_capacity(self):
        with Session(test_engine) as s:
            emp = _create_employee(s, self.dept_eng_id, "cap1@test.com")
            emp2 = _create_employee(s, self.dept_eng_id, "cap2@test.com")
            act = _create_activity(s, self.category_id, max_participants=1)
            act_id = act.id
            h1 = _auth_header(emp)
            h2 = _auth_header(emp2)
        resp1 = client.post(
            f"/api/v1/social/activities/{act_id}/join",
            headers=h1,
        )
        assert resp1.status_code == 201
        resp2 = client.post(
            f"/api/v1/social/activities/{act_id}/join",
            headers=h2,
        )
        assert resp2.status_code == 400

    # ── Submit Proof ──

    def test_submit_proof(self):
        with Session(test_engine) as s:
            emp2 = _create_employee(s, self.dept_eng_id, "proof1-emp2@test.com")
            h = _auth_header(emp2)
        client.post(
            f"/api/v1/social/activities/{self.activity_id}/join",
            headers=h,
        )
        response = client.post(
            f"/api/v1/social/activities/{self.activity_id}/submit-proof",
            json={"proof_file_url": "https://example.com/proof.jpg"},
            headers=_auth_header(emp2),
        )
        assert response.status_code == 200
        assert response.json()["proof_file_url"] == "https://example.com/proof.jpg"

    def test_submit_proof_not_joined(self):
        with Session(test_engine) as s:
            emp = _create_employee(s, self.dept_eng_id, "proof404@test.com")
            h = _auth_header(emp)
        response = client.post(
            f"/api/v1/social/activities/{self.activity_id}/submit-proof",
            json={"proof_file_url": "https://example.com/proof.jpg"},
            headers=h,
        )
        assert response.status_code == 404

    # ── Approve Participation (Evidence Requirement) ──

    def test_approve_participation_with_proof(self):
        with Session(test_engine) as s:
            emp = _create_employee(s, self.dept_eng_id, "aprov1@test.com")
            act = _create_activity(s, self.category_id, title="ApproveTest1")
            part = EmployeeParticipation(
                employee_id=emp.id,
                activity_id=act.id,
                proof_file_url="https://example.com/proof.jpg",
            )
            s.add(part)
            s.commit()
            s.refresh(part)
            part_id = part.id
            expected_points = act.points_reward

        response = client.post(
            f"/api/v1/social/participations/{part_id}/approve",
            headers=self._get_admin_header(),
        )
        assert response.status_code == 200
        data = response.json()
        assert data["approval_status"] == "Approved"
        assert data["points_earned"] == expected_points

    def test_approve_participation_blocked_without_proof(self):
        with Session(test_engine) as s:
            config = s.get(SystemConfiguration, 1)
            config.evidence_requirement = True
            s.add(config)
            s.commit()

        with Session(test_engine) as s:
            emp = _create_employee(s, self.dept_eng_id, "aprov2@test.com")
            act = _create_activity(s, self.category_id, title="ApproveTest2")
            part = EmployeeParticipation(
                employee_id=emp.id,
                activity_id=act.id,
                proof_file_url=None,
            )
            s.add(part)
            s.commit()
            s.refresh(part)
            part_id = part.id

        response = client.post(
            f"/api/v1/social/participations/{part_id}/approve",
            headers=self._get_admin_header(),
        )
        assert response.status_code == 400
        assert "Evidence required" in response.json()["detail"]

        with Session(test_engine) as s:
            config = s.get(SystemConfiguration, 1)
            config.evidence_requirement = True
            s.add(config)
            s.commit()

    def test_approve_participation_allowed_without_proof_if_toggle_off(self):
        with Session(test_engine) as s:
            config = s.get(SystemConfiguration, 1)
            config.evidence_requirement = False
            s.add(config)
            s.commit()

        with Session(test_engine) as s:
            emp = _create_employee(s, self.dept_eng_id, "aprov3@test.com")
            act = _create_activity(s, self.category_id, title="ApproveTest3")
            part = EmployeeParticipation(
                employee_id=emp.id,
                activity_id=act.id,
                proof_file_url=None,
            )
            s.add(part)
            s.commit()
            s.refresh(part)
            part_id = part.id

        response = client.post(
            f"/api/v1/social/participations/{part_id}/approve",
            headers=self._get_admin_header(),
        )
        assert response.status_code == 200
        assert response.json()["approval_status"] == "Approved"

        with Session(test_engine) as s:
            config = s.get(SystemConfiguration, 1)
            config.evidence_requirement = True
            s.add(config)
            s.commit()

    # ── Diversity Metrics ──

    def test_diversity_metrics(self):
        with Session(test_engine) as s:
            _create_employee(s, self.dept_eng_id, "div1@test.com", gender="Male")
            _create_employee(s, self.dept_eng_id, "div2@test.com", gender="Female")
            _create_employee(s, self.dept_mkt_id, "div3@test.com", gender="Female")
            _create_employee(s, self.dept_mkt_id, "div4@test.com", gender="Male")

        response = client.get("/api/v1/social/diversity-metrics")
        assert response.status_code == 200
        data = response.json()
        assert data["total_employees"] >= 5
        assert "Engineering" in data["department_dispersion"]
        assert "Marketing" in data["department_dispersion"]


def teardown_module():
    app.dependency_overrides.clear()
    try:
        import os
        if os.path.exists("./test_ecosphere.db"):
            os.remove("./test_ecosphere.db")
    except Exception:
        pass
