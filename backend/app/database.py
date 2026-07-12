from sqlmodel import SQLModel, create_engine, Session, select
from app.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, echo=False, connect_args=connect_args)

def init_db():
    from app.modules.auth.models import Department, Employee
    from app.modules.settings.models import Category, DepartmentScore, SystemConfiguration, Notification
    from app.modules.environmental.models import EmissionFactor, ProductESGProfile, EnvironmentalGoal, CarbonTransaction
    from app.modules.social.models import CSRActivity, EmployeeParticipation
    from app.modules.governance.models import ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue
    from app.modules.gamification.models import Badge, Reward, Challenge, ChallengeParticipation, BadgeUnlock, RewardRedemption

    SQLModel.metadata.create_all(engine)
    seed_initial_data()

def seed_initial_data():
    from datetime import date, datetime
    from app.modules.auth.models import Department, Employee
    from app.modules.settings.models import Category, DepartmentScore, SystemConfiguration
    from app.modules.environmental.models import EmissionFactor, ProductESGProfile, EnvironmentalGoal
    from app.modules.social.models import CSRActivity
    from app.modules.governance.models import ESGPolicy, Audit, ComplianceIssue
    from app.modules.gamification.models import Badge, Reward, Challenge
    from app.modules.auth.service import hash_password

    with Session(engine) as session:
        existing = session.exec(select(Department)).first()
        if existing:
            return

        depts = [
            Department(name="Corporate", code="CORP", head="Alice Vance", employee_count=10, status="Active"),
            Department(name="Manufacturing", code="MFG", head="Bob Sterling", employee_count=25, status="Active"),
            Department(name="Logistics", code="LOG", head="Mark Robinson", employee_count=15, status="Active"),
            Department(name="Research & Development", code="RND", head="Dr. Sarah Chen", employee_count=12, status="Active"),
            Department(name="Sales", code="SALES", head="James Wilson", employee_count=8, status="Active"),
        ]
        session.add_all(depts)
        session.flush()

        employees = [
            Employee(name="Admin User", email="admin@ecosphere.com", password_hash=hash_password("admin123"), role="Admin", gender="Prefer not to say", department_id=depts[0].id, xp_points=5000, redeemable_points=2000),
            Employee(name="Employee User", email="employee@ecosphere.com", password_hash=hash_password("employee123"), role="Employee", gender="Female", department_id=depts[1].id, xp_points=1500, redeemable_points=500),
            Employee(name="Aditi Rao", email="aditi@ecosphere.com", password_hash=hash_password("aditi123"), role="ESG Manager", gender="Female", department_id=depts[3].id, xp_points=3910, redeemable_points=1200),
            Employee(name="Karan Shah", email="karan@ecosphere.com", password_hash=hash_password("karan123"), role="Employee", gender="Male", department_id=depts[0].id, xp_points=1250, redeemable_points=400),
            Employee(name="Sarah Jenkins", email="sarah@ecosphere.com", password_hash=hash_password("sarah123"), role="Employee", gender="Female", department_id=depts[3].id, xp_points=1480, redeemable_points=600),
            Employee(name="Mark Robinson", email="mark@ecosphere.com", password_hash=hash_password("mark123"), role="Employee", gender="Male", department_id=depts[2].id, xp_points=850, redeemable_points=200),
            Employee(name="Auditor User", email="auditor@ecosphere.com", password_hash=hash_password("auditor123"), role="Auditor", gender="Prefer not to say", department_id=depts[0].id, xp_points=2000, redeemable_points=800),
        ]
        session.add_all(employees)
        session.flush()

        categories = [
            Category(name="Office Carbon Reduction", type="Challenge", status="Active"),
            Category(name="Community Outreach", type="CSR Activity", status="Active"),
            Category(name="Renewable Transition", type="Challenge", status="Active"),
            Category(name="Office Green", type="Challenge", status="Active"),
            Category(name="Transport", type="Challenge", status="Active"),
            Category(name="Electricity", type="Challenge", status="Active"),
            Category(name="Health & Wellness", type="CSR Activity", status="Active"),
            Category(name="Education", type="CSR Activity", status="Active"),
        ]
        session.add_all(categories)
        session.flush()

        config = SystemConfiguration(
            auto_emission_calculation=True,
            evidence_requirement=True,
            badge_auto_award=True,
            environmental_weight=0.40,
            social_weight=0.30,
            governance_weight=0.30,
        )
        session.add(config)

        factors = [
            EmissionFactor(activity_type="Grid Electricity", factor_value=0.385, unit="kg CO2e / kWh", status="Active"),
            EmissionFactor(activity_type="Diesel (Mobile Burn)", factor_value=2.687, unit="kg CO2e / Litre", status="Active"),
            EmissionFactor(activity_type="Natural Gas", factor_value=2.021, unit="kg CO2e / m³", status="Active"),
            EmissionFactor(activity_type="Economy Flight (Short Haul)", factor_value=0.158, unit="kg CO2e / km", status="Active"),
        ]
        session.add_all(factors)
        session.flush()

        products = [
            ProductESGProfile(product_name="EcoCharger Max", product_sku="SKU-9902-EL", carbon_footprint_kg=1.25, recyclability_percentage=94, water_footprint_liters=0.5, status="Active"),
            ProductESGProfile(product_name='BioSleeve Case 13"', product_sku="SKU-4819-PK", carbon_footprint_kg=0.42, recyclability_percentage=100, water_footprint_liters=0.1, status="Active"),
            ProductESGProfile(product_name="DeskOrganizer Pro", product_sku="SKU-2051-HW", carbon_footprint_kg=3.88, recyclability_percentage=78, water_footprint_liters=1.2, status="Active"),
        ]
        session.add_all(products)
        session.flush()

        goals = [
            EnvironmentalGoal(title="Reduce Fleet Emissions", target_emission_reduction=500, target_date=date(2026, 12, 31), current_progress=390, status="Active"),
            EnvironmentalGoal(title="Cut Packaging Waste", target_emission_reduction=120, target_date=date(2026, 9, 30), current_progress=98, status="Active"),
            EnvironmentalGoal(title="Office Energy Cut", target_emission_reduction=80, target_date=date(2026, 6, 30), current_progress=80, status="Active"),
        ]
        session.add_all(goals)
        session.flush()

        activities = [
            CSRActivity(title="Tree Plantation Drive", description="Plant trees in the local community park", category_id=categories[1].id, date=date(2026, 8, 15), points_reward=50, max_participants=100, status="Upcoming"),
            CSRActivity(title="Blood Donation Camp", description="Annual blood donation drive with Red Cross", category_id=categories[6].id, date=date(2026, 9, 10), points_reward=50, max_participants=50, status="Upcoming"),
            CSRActivity(title="Beach Cleanup", description="Clean up the coastal shoreline area", category_id=categories[1].id, date=date(2026, 8, 22), points_reward=50, max_participants=80, status="Upcoming"),
            CSRActivity(title="ESG Workshop", description="Educational workshop on ESG principles", category_id=categories[7].id, date=date(2026, 9, 5), points_reward=30, max_participants=200, status="Upcoming"),
        ]
        session.add_all(activities)
        session.flush()

        policies = [
            ESGPolicy(title="Sustainability Code of Conduct", description="Guides office guidelines regarding single-use plastics, recycling practices, and sustainable commute incentives.", version="2.1", effective_date=date(2026, 1, 15), status="Active"),
            ESGPolicy(title="Responsible Sourcing & Vendor Policy", description="Mandates environmental standards for vendors, covering Scope 3 footprint logging and fair labor certifications.", version="1.0", effective_date=date(2026, 3, 2), status="Active"),
            ESGPolicy(title="Anti-Bribery & Corruption Policy", description="Rules and regulations for anti-bribery, ethics, compliance and anti-money laundering guidelines.", version="3.0", effective_date=date(2025, 11, 10), status="Active"),
            ESGPolicy(title="Environmental Health & Safety Guidelines", description="EHS guidelines for heavy machinery, waste handling, and emergency response procedures.", version="1.2", effective_date=date(2026, 6, 1), status="Draft"),
        ]
        session.add_all(policies)
        session.flush()

        audits = [
            Audit(title="Q2 Waste Audit", auditor="S. Nair", audit_date=date(2026, 6, 12), score=85.0, status="Completed"),
            Audit(title="Vendor Compliance Check", auditor="R. Iyer", audit_date=date(2026, 7, 1), score=72.0, status="Completed"),
            Audit(title="ISO 14064 Carbon Verification", auditor="SGS International", audit_date=date(2026, 6, 15), score=90.0, status="Completed"),
        ]
        session.add_all(audits)
        session.flush()

        issues = [
            ComplianceIssue(audit_id=audits[0].id, title="Missing MSDS sheets", description="Material Safety Data Sheets not found for 3 chemicals", severity="High", owner_id=employees[1].id, due_date=date(2026, 7, 1), status="Open"),
            ComplianceIssue(audit_id=audits[1].id, title="Late vendor disclosure", description="Vendor XYZ failed to disclose environmental impact data on time", severity="Medium", owner_id=employees[0].id, due_date=date(2026, 7, 5), status="Resolved"),
            ComplianceIssue(audit_id=audits[2].id, title="Scope 1 fuel logs missing", description="Q2 fleet fuel consumption logs not submitted", severity="High", owner_id=employees[2].id, due_date=date(2026, 7, 1), status="Open"),
        ]
        session.add_all(issues)
        session.flush()

        badges = [
            Badge(name="Eco Warrior", description="Accumulate 500 XP from environmental actions", unlock_rule='{"metric":"xp","value":500}', icon="leaf"),
            Badge(name="Carbon Reducer", description="Reduce personal carbon footprint by 20%", unlock_rule='{"metric":"xp","value":1000}', icon="flame"),
            Badge(name="Challenge Master", description="Complete 5 challenges successfully", unlock_rule='{"metric":"challenges","value":5}', icon="trophy"),
            Badge(name="Community Hero", description="Participate in 3 CSR activities", unlock_rule='{"metric":"activities","value":3}', icon="heart"),
        ]
        session.add_all(badges)
        session.flush()

        rewards = [
            Reward(name="Gift Voucher", description="$50 Amazon Gift Voucher", points_required=500, stock=10, status="Active"),
            Reward(name="Eco Merch Pack", description="Reusable water bottle + tote bag + bamboo utensil set", points_required=300, stock=20, status="Active"),
            Reward(name="Charity Donation", description="Donate $100 to an environmental charity of your choice", points_required=800, stock=5, status="Active"),
            Reward(name="Extra PTO Day", description="One extra paid day off", points_required=1000, stock=3, status="Active"),
        ]
        session.add_all(rewards)
        session.flush()

        challenges = [
            Challenge(title="Sustainability Sprint", category_id=categories[0].id, description="Participate in carbon offsetting, waste recycling, and energy efficiency actions to score points.", xp=200, difficulty="Hard", evidence_required=True, deadline=datetime(2026, 7, 20), status="Active"),
            Challenge(title="Recycle Challenge", category_id=categories[3].id, description="Sort office waste into designated organic, recyclable, and general bins for 5 days.", xp=80, difficulty="Easy", evidence_required=True, deadline=datetime(2026, 7, 15), status="Active"),
            Challenge(title="Commute Green Week", category_id=categories[4].id, description="Walk, cycle, carpool or take public transit to work for 4 consecutive days.", xp=120, difficulty="Medium", evidence_required=True, deadline=datetime(2026, 7, 25), status="Draft"),
            Challenge(title="The Paperless Office", category_id=categories[3].id, description="Avoid printing any physical documents for 5 consecutive workdays.", xp=100, difficulty="Easy", evidence_required=False, deadline=datetime(2026, 7, 30), status="Active"),
            Challenge(title="Energy Audit Champion", category_id=categories[5].id, description="Perform a standby energy audit check on idle appliances in your department.", xp=250, difficulty="Medium", evidence_required=True, deadline=datetime(2026, 8, 1), status="Active"),
        ]
        session.add_all(challenges)
        session.flush()

        scores = [
            DepartmentScore(department_id=depts[0].id, environmental_score=82, social_score=74, governance_score=88, total_score=81, calculation_date=date.today()),
            DepartmentScore(department_id=depts[1].id, environmental_score=68, social_score=72, governance_score=80, total_score=73, calculation_date=date.today()),
            DepartmentScore(department_id=depts[2].id, environmental_score=55, social_score=60, governance_score=65, total_score=60, calculation_date=date.today()),
            DepartmentScore(department_id=depts[3].id, environmental_score=90, social_score=85, governance_score=78, total_score=84, calculation_date=date.today()),
            DepartmentScore(department_id=depts[4].id, environmental_score=45, social_score=55, governance_score=60, total_score=53, calculation_date=date.today()),
        ]
        session.add_all(scores)
        session.commit()

def get_session():
    with Session(engine) as session:
        yield session
