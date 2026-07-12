import csv
from io import StringIO
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select, func
from datetime import date
from typing import Optional, Any

from app.modules.reports.models import ReportFilter
from app.modules.environmental.models import CarbonTransaction, EmissionFactor
from app.modules.social.models import CSRActivity, EmployeeParticipation
from app.modules.governance.models import Audit, ComplianceIssue, ESGPolicy, PolicyAcknowledgement
from app.modules.settings.models import DepartmentScore, SystemConfiguration
from app.modules.auth.models import Department, Employee


def _apply_filters(query, filters: ReportFilter, date_column=None):
    if filters.department_id:
        query = query.where(CarbonTransaction.department_id == filters.department_id)
    if filters.start_date and date_column is not None:
        query = query.where(date_column >= filters.start_date)
    if filters.end_date and date_column is not None:
        query = query.where(date_column <= filters.end_date)
    return query


# -- Environmental Report --

def get_environmental_data(session: Session, filters: ReportFilter) -> dict[str, Any]:
    query = select(
        CarbonTransaction,
        EmissionFactor.activity_type,
        Department.name.label("department_name")
    ).join(
        EmissionFactor, CarbonTransaction.emission_factor_id == EmissionFactor.id
    ).join(
        Department, CarbonTransaction.department_id == Department.id
    )

    if filters.department_id:
        query = query.where(CarbonTransaction.department_id == filters.department_id)
    if filters.start_date:
        query = query.where(CarbonTransaction.transaction_date >= filters.start_date)
    if filters.end_date:
        query = query.where(CarbonTransaction.transaction_date <= filters.end_date)

    rows = session.exec(query).all()

    transactions = []
    total_emissions = 0.0
    for row in rows:
        tx = row[0]
        transactions.append({
            "id": tx.id,
            "source_type": tx.source_type,
            "source_id": tx.source_id,
            "raw_value": tx.raw_value,
            "activity_type": row[1],
            "calculated_emissions_kg": tx.calculated_emissions_kg,
            "transaction_date": tx.transaction_date.isoformat(),
            "department_name": row[2],
        })
        total_emissions += tx.calculated_emissions_kg

    summary_query = select(
        CarbonTransaction.source_type,
        func.sum(CarbonTransaction.calculated_emissions_kg).label("total"),
        func.count(CarbonTransaction.id).label("count")
    )
    if filters.department_id:
        summary_query = summary_query.where(CarbonTransaction.department_id == filters.department_id)
    if filters.start_date:
        summary_query = summary_query.where(CarbonTransaction.transaction_date >= filters.start_date)
    if filters.end_date:
        summary_query = summary_query.where(CarbonTransaction.transaction_date <= filters.end_date)
    summary_query = summary_query.group_by(CarbonTransaction.source_type)
    summary_rows = session.exec(summary_query).all()

    by_source = {r[0]: {"total_emissions_kg": float(r[1]), "transaction_count": r[2]} for r in summary_rows}

    return {
        "module": "environmental",
        "total_emissions_kg": total_emissions,
        "transaction_count": len(transactions),
        "by_source_type": by_source,
        "transactions": transactions,
    }


# -- Social Report --

def get_social_data(session: Session, filters: ReportFilter) -> dict[str, Any]:
    query = select(
        CSRActivity,
        EmployeeParticipation,
        Employee.name.label("employee_name"),
        Employee.department_id,
    ).join(
        EmployeeParticipation, CSRActivity.id == EmployeeParticipation.activity_id,
        isouter=True
    ).join(
        Employee, EmployeeParticipation.employee_id == Employee.id,
        isouter=True
    )

    if filters.department_id:
        query = query.where(Employee.department_id == filters.department_id)
    if filters.category_id:
        query = query.where(CSRActivity.category_id == filters.category_id)
    if filters.start_date:
        query = query.where(CSRActivity.date >= filters.start_date)
    if filters.end_date:
        query = query.where(CSRActivity.date <= filters.end_date)

    rows = session.exec(query).all()

    activities = {}
    total_participations = 0
    total_points_awarded = 0
    for row in rows:
        activity = row[0]
        if activity.id not in activities:
            activities[activity.id] = {
                "id": activity.id,
                "title": activity.title,
                "date": activity.date.isoformat(),
                "points_reward": activity.points_reward,
                "status": activity.status,
                "participants": [],
            }
        participation = row[1]
        if participation:
            activities[activity.id]["participants"].append({
                "employee_name": row[2],
                "approval_status": participation.approval_status,
                "points_earned": participation.points_earned,
                "completion_date": participation.completion_date.isoformat() if participation.completion_date else None,
            })
            total_participations += 1
            total_points_awarded += participation.points_earned

    return {
        "module": "social",
        "total_activities": len(activities),
        "total_participations": total_participations,
        "total_points_awarded": total_points_awarded,
        "activities": list(activities.values()),
    }


# -- Governance Report --

def get_governance_data(session: Session, filters: ReportFilter) -> dict[str, Any]:
    issues_query = select(ComplianceIssue)
    if filters.department_id:
        issues_query = issues_query.join(Employee, ComplianceIssue.owner_id == Employee.id).where(
            Employee.department_id == filters.department_id
        )
    if filters.start_date:
        issues_query = issues_query.where(ComplianceIssue.due_date >= filters.start_date)
    if filters.end_date:
        issues_query = issues_query.where(ComplianceIssue.due_date <= filters.end_date)
    issues = session.exec(issues_query).all()

    audits_query = select(Audit)
    if filters.start_date:
        audits_query = audits_query.where(Audit.audit_date >= filters.start_date)
    if filters.end_date:
        audits_query = audits_query.where(Audit.audit_date <= filters.end_date)
    audits = session.exec(audits_query).all()

    policies_count = session.exec(select(func.count(ESGPolicy.id))).one()
    acknowledgements_count = session.exec(select(func.count(PolicyAcknowledgement.id))).one()

    severity_counts = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    status_counts = {"Open": 0, "Resolved": 0, "Overdue": 0}
    for issue in issues:
        severity_counts[issue.severity] = severity_counts.get(issue.severity, 0) + 1
        status_counts[issue.status] = status_counts.get(issue.status, 0) + 1

    return {
        "module": "governance",
        "total_policies": policies_count[0] if isinstance(policies_count, tuple) else policies_count,
        "total_acknowledgements": acknowledgements_count[0] if isinstance(acknowledgements_count, tuple) else acknowledgements_count,
        "total_audits": len(audits),
        "total_issues": len(issues),
        "issues_by_severity": severity_counts,
        "issues_by_status": status_counts,
        "audits": [
            {
                "id": a.id,
                "title": a.title,
                "auditor": a.auditor,
                "audit_date": a.audit_date.isoformat(),
                "score": a.score,
                "status": a.status,
            }
            for a in audits
        ],
        "issues": [
            {
                "id": i.id,
                "title": i.title,
                "severity": i.severity,
                "status": i.status,
                "due_date": i.due_date.isoformat(),
                "owner_id": i.owner_id,
            }
            for i in issues
        ],
    }


# -- ESG Summary Report --

def get_esg_summary(session: Session, filters: ReportFilter) -> dict[str, Any]:
    config = session.get(SystemConfiguration, 1)
    env_w = config.environmental_weight if config else 0.40
    soc_w = config.social_weight if config else 0.30
    gov_w = config.governance_weight if config else 0.30

    query = select(DepartmentScore, Department.name).join(
        Department, DepartmentScore.department_id == Department.id
    )
    if filters.department_id:
        query = query.where(DepartmentScore.department_id == filters.department_id)
    if filters.start_date:
        query = query.where(DepartmentScore.calculation_date >= filters.start_date)
    if filters.end_date:
        query = query.where(DepartmentScore.calculation_date <= filters.end_date)
    query = query.order_by(DepartmentScore.calculation_date.desc())

    rows = session.exec(query).all()

    department_scores = []
    overall_total = 0.0
    count = 0
    for row in rows:
        ds = row[0]
        weighted = (ds.environmental_score * env_w) + (ds.social_score * soc_w) + (ds.governance_score * gov_w)
        department_scores.append({
            "department_id": ds.department_id,
            "department_name": row[1],
            "environmental_score": ds.environmental_score,
            "social_score": ds.social_score,
            "governance_score": ds.governance_score,
            "total_score": ds.total_score,
            "weighted_score": round(weighted, 2),
            "calculation_date": ds.calculation_date.isoformat(),
        })
        overall_total += weighted
        count += 1

    overall_esg_score = round(overall_total / count, 2) if count > 0 else 0.0

    return {
        "module": "esg_summary",
        "overall_esg_score": overall_esg_score,
        "weights_used": {
            "environmental": env_w,
            "social": soc_w,
            "governance": gov_w,
        },
        "department_count": count,
        "departments": department_scores,
    }


# -- CSV Export --

def _dict_to_csv(data: list[dict]) -> str:
    if not data:
        return ""
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
    return output.getvalue()


def export_report_csv(report_data: dict[str, Any], filename: str = "report.csv") -> StreamingResponse:
    rows = _extract_flat_rows(report_data)
    csv_content = _dict_to_csv(rows)
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _extract_flat_rows(data: dict[str, Any]) -> list[dict]:
    if "transactions" in data:
        return data["transactions"] or [{"source_type": "", "source_id": "", "raw_value": "", "activity_type": "", "calculated_emissions_kg": "", "transaction_date": "", "department_name": ""}]
    if "activities" in data:
        rows = []
        for act in data["activities"]:
            if act.get("participants"):
                for p in act["participants"]:
                    row = {k: v for k, v in act.items() if k != "participants"}
                    row.update(p)
                    rows.append(row)
            else:
                rows.append({k: v for k, v in act.items() if k != "participants"})
        return rows or [{"title": "", "date": "", "status": ""}]
    if "issues" in data:
        return data["issues"] or [{"title": "", "severity": "", "status": "", "due_date": "", "owner_id": ""}]
    if "audits" in data:
        return data["audits"] or [{"title": "", "auditor": "", "audit_date": "", "score": "", "status": ""}]
    if "departments" in data:
        return data["departments"] or [{"department_id": "", "department_name": "", "environmental_score": "", "social_score": "", "governance_score": "", "total_score": "", "weighted_score": "", "calculation_date": ""}]
    return [data]
