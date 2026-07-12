from sqlmodel import Session, select
from datetime import date, datetime
from typing import List, Optional

from app.modules.settings.models import Notification
from app.modules.governance.models import (
    ESGPolicy,
    PolicyAcknowledgement,
    Audit,
    ComplianceIssue,
    ESGPolicyCreate,
    ESGPolicyUpdate,
    AuditCreate,
    AuditUpdate,
    ComplianceIssueCreate,
    ComplianceIssueUpdate,
)


# ──────────────────────────────────────────────
#  Notification Utility
# ──────────────────────────────────────────────

def create_notification(
    session: Session,
    employee_id: int,
    title: str,
    message: str,
    notification_type: str = "Alert",
) -> Notification:
    note = Notification(
        employee_id=employee_id,
        title=title,
        message=message,
        notification_type=notification_type,
    )
    session.add(note)
    session.commit()
    session.refresh(note)
    return note


# ──────────────────────────────────────────────
#  ESG Policy CRUD
# ──────────────────────────────────────────────

def create_policy(session: Session, data: ESGPolicyCreate) -> ESGPolicy:
    policy = ESGPolicy(**data.model_dump())
    session.add(policy)
    session.commit()
    session.refresh(policy)
    return policy


def list_policies(session: Session) -> List[ESGPolicy]:
    return session.exec(select(ESGPolicy)).all()


def get_policy(session: Session, policy_id: int) -> Optional[ESGPolicy]:
    return session.get(ESGPolicy, policy_id)


def update_policy(session: Session, policy_id: int, data: ESGPolicyUpdate) -> Optional[ESGPolicy]:
    policy = session.get(ESGPolicy, policy_id)
    if not policy:
        return None
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(policy, key, val)
    session.add(policy)
    session.commit()
    session.refresh(policy)
    return policy


def delete_policy(session: Session, policy_id: int) -> bool:
    policy = session.get(ESGPolicy, policy_id)
    if not policy:
        return False
    session.delete(policy)
    session.commit()
    return True


# ──────────────────────────────────────────────
#  Policy Acknowledgement
# ──────────────────────────────────────────────

def acknowledge_policy(session: Session, policy_id: int, employee_id: int) -> Optional[PolicyAcknowledgement]:
    policy = session.get(ESGPolicy, policy_id)
    if not policy:
        return None
    ack = PolicyAcknowledgement(employee_id=employee_id, policy_id=policy_id)
    session.add(ack)
    session.commit()
    session.refresh(ack)
    return ack


# ──────────────────────────────────────────────
#  Audit CRUD
# ──────────────────────────────────────────────

def create_audit(session: Session, data: AuditCreate) -> Audit:
    audit = Audit(**data.model_dump())
    session.add(audit)
    session.commit()
    session.refresh(audit)
    return audit


def list_audits(session: Session) -> List[Audit]:
    return session.exec(select(Audit)).all()


def get_audit(session: Session, audit_id: int) -> Optional[Audit]:
    return session.get(Audit, audit_id)


def update_audit(session: Session, audit_id: int, data: AuditUpdate) -> Optional[Audit]:
    audit = session.get(Audit, audit_id)
    if not audit:
        return None
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(audit, key, val)
    session.add(audit)
    session.commit()
    session.refresh(audit)
    return audit


def delete_audit(session: Session, audit_id: int) -> bool:
    audit = session.get(Audit, audit_id)
    if not audit:
        return False
    session.delete(audit)
    session.commit()
    return True


# ──────────────────────────────────────────────
#  Compliance Issue CRUD
# ──────────────────────────────────────────────

def create_issue(session: Session, data: ComplianceIssueCreate) -> ComplianceIssue:
    issue = ComplianceIssue(**data.model_dump())
    session.add(issue)
    session.commit()
    session.refresh(issue)
    return issue


def list_issues(session: Session) -> List[ComplianceIssue]:
    return session.exec(select(ComplianceIssue)).all()


def get_issue(session: Session, issue_id: int) -> Optional[ComplianceIssue]:
    return session.get(ComplianceIssue, issue_id)


def update_issue(session: Session, issue_id: int, data: ComplianceIssueUpdate) -> Optional[ComplianceIssue]:
    issue = session.get(ComplianceIssue, issue_id)
    if not issue:
        return None
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(issue, key, val)
    session.add(issue)
    session.commit()
    session.refresh(issue)
    return issue


def delete_issue(session: Session, issue_id: int) -> bool:
    issue = session.get(ComplianceIssue, issue_id)
    if not issue:
        return False
    session.delete(issue)
    session.commit()
    return True


# ──────────────────────────────────────────────
#  Overdue Check
# ──────────────────────────────────────────────

def check_overdue_issues(session: Session) -> List[Notification]:
    today = date.today()
    overdue_issues = session.exec(
        select(ComplianceIssue).where(
            ComplianceIssue.status == "Open",
            ComplianceIssue.due_date < today,
        )
    ).all()

    notifications: List[Notification] = []
    for issue in overdue_issues:
        issue.status = "Overdue"
        session.add(issue)

        note = create_notification(
            session,
            employee_id=issue.owner_id,
            title="Compliance Issue Overdue",
            message=(
                f"Compliance issue '{issue.title}' (ID: {issue.id}) "
                f"was due on {issue.due_date} and is now overdue."
            ),
            notification_type="Alert",
        )
        notifications.append(note)

    if overdue_issues:
        session.commit()

    return notifications


# ──────────────────────────────────────────────
#  Enhanced Audit Workflow
# ──────────────────────────────────────────────

def complete_audit(session: Session, audit_id: int, findings: str) -> Optional[Audit]:
    audit = session.get(Audit, audit_id)
    if not audit:
        return None
    audit.status = "Completed"
    if hasattr(audit, 'findings'):
        audit.findings = findings
    session.add(audit)
    session.commit()
    session.refresh(audit)
    return audit


def resolve_issue(session: Session, issue_id: int, resolution_notes: str) -> Optional[ComplianceIssue]:
    issue = session.get(ComplianceIssue, issue_id)
    if not issue:
        return None
    issue.status = "Resolved"
    if hasattr(issue, 'resolution_notes'):
        issue.resolution_notes = resolution_notes
    session.add(issue)
    session.commit()
    session.refresh(issue)
    return issue


def review_issue(session: Session, issue_id: int, new_status: str, review_notes: str) -> Optional[ComplianceIssue]:
    issue = session.get(ComplianceIssue, issue_id)
    if not issue:
        return None
    issue.status = new_status
    if hasattr(issue, 'review_notes'):
        issue.review_notes = review_notes
    session.add(issue)
    session.commit()
    session.refresh(issue)
    return issue
