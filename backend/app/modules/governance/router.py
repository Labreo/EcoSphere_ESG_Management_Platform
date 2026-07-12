from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.database import get_session

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
    NotificationRead,
)
from app.modules.governance.service import (
    acknowledge_policy,
    create_audit,
    create_issue,
    create_policy,
    delete_audit,
    delete_issue,
    delete_policy,
    get_audit,
    get_issue,
    get_policy,
    list_audits,
    list_issues,
    list_policies,
    update_audit,
    update_issue,
    update_policy,
    check_overdue_issues,
)

router = APIRouter(prefix="/governance", tags=["Governance Module"])


# ──────────────────────────────────────────────
#  ESG Policies
# ──────────────────────────────────────────────

@router.get("/policies", response_model=list[ESGPolicy])
def list_policies_endpoint(session: Session = Depends(get_session)):
    return list_policies(session)


@router.post("/policies", response_model=ESGPolicy, status_code=status.HTTP_201_CREATED)
def create_policy_endpoint(data: ESGPolicyCreate, session: Session = Depends(get_session)):
    return create_policy(session, data)


@router.get("/policies/{policy_id}", response_model=ESGPolicy)
def get_policy_endpoint(policy_id: int, session: Session = Depends(get_session)):
    policy = get_policy(session, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.put("/policies/{policy_id}", response_model=ESGPolicy)
def update_policy_endpoint(policy_id: int, data: ESGPolicyUpdate, session: Session = Depends(get_session)):
    policy = update_policy(session, policy_id, data)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.delete("/policies/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_policy_endpoint(policy_id: int, session: Session = Depends(get_session)):
    if not delete_policy(session, policy_id):
        raise HTTPException(status_code=404, detail="Policy not found")


# ──────────────────────────────────────────────
#  Policy Acknowledgement
# ──────────────────────────────────────────────

@router.post("/policies/{policy_id}/acknowledge", response_model=PolicyAcknowledgement)
def acknowledge_policy_endpoint(policy_id: int, employee_id: int, session: Session = Depends(get_session)):
    ack = acknowledge_policy(session, policy_id, employee_id)
    if not ack:
        raise HTTPException(status_code=404, detail="Policy not found")
    return ack


# ──────────────────────────────────────────────
#  Audits
# ──────────────────────────────────────────────

@router.get("/audits", response_model=list[Audit])
def list_audits_endpoint(session: Session = Depends(get_session)):
    return list_audits(session)


@router.post("/audits", response_model=Audit, status_code=status.HTTP_201_CREATED)
def create_audit_endpoint(data: AuditCreate, session: Session = Depends(get_session)):
    return create_audit(session, data)


@router.get("/audits/{audit_id}", response_model=Audit)
def get_audit_endpoint(audit_id: int, session: Session = Depends(get_session)):
    audit = get_audit(session, audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit


@router.put("/audits/{audit_id}", response_model=Audit)
def update_audit_endpoint(audit_id: int, data: AuditUpdate, session: Session = Depends(get_session)):
    audit = update_audit(session, audit_id, data)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit


@router.delete("/audits/{audit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_audit_endpoint(audit_id: int, session: Session = Depends(get_session)):
    if not delete_audit(session, audit_id):
        raise HTTPException(status_code=404, detail="Audit not found")


# ──────────────────────────────────────────────
#  Compliance Issues
# ──────────────────────────────────────────────

@router.get("/issues", response_model=list[ComplianceIssue])
def list_issues_endpoint(session: Session = Depends(get_session)):
    issues = list_issues(session)
    return issues


@router.post("/issues", response_model=ComplianceIssue, status_code=status.HTTP_201_CREATED)
def create_issue_endpoint(data: ComplianceIssueCreate, session: Session = Depends(get_session)):
    return create_issue(session, data)


@router.get("/issues/{issue_id}", response_model=ComplianceIssue)
def get_issue_endpoint(issue_id: int, session: Session = Depends(get_session)):
    issue = get_issue(session, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Compliance issue not found")
    return issue


@router.put("/issues/{issue_id}", response_model=ComplianceIssue)
def update_issue_endpoint(issue_id: int, data: ComplianceIssueUpdate, session: Session = Depends(get_session)):
    issue = update_issue(session, issue_id, data)
    if not issue:
        raise HTTPException(status_code=404, detail="Compliance issue not found")
    return issue


@router.delete("/issues/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue_endpoint(issue_id: int, session: Session = Depends(get_session)):
    if not delete_issue(session, issue_id):
        raise HTTPException(status_code=404, detail="Compliance issue not found")


# ──────────────────────────────────────────────
#  Overdue Check (manual trigger)
# ──────────────────────────────────────────────

@router.post("/issues/check-overdue", response_model=list[NotificationRead])
def check_overdue_endpoint(session: Session = Depends(get_session)):
    notifications = check_overdue_issues(session)
    return [
        NotificationRead(
            id=n.id,
            employee_id=n.employee_id,
            title=n.title,
            message=n.message,
            notification_type=n.notification_type,
            is_read=n.is_read,
            created_at=n.created_at,
        )
        for n in notifications
    ]
