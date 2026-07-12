import { get, post, put, del } from './client.js';

function mapPolicy(p) {
  return {
    id: `pol-${p.id}`,
    title: p.title,
    version: p.version,
    status: p.status === 'Active' ? 'Active' : p.status === 'Draft' ? 'Draft' : 'Retired',
    scope: 'Global',
    description: p.description,
    publishedDate: p.effective_date || '—',
    acknowledgedCount: 0,
    totalRequired: 0,
  };
}

function mapAcknowledgement(a) {
  return {
    id: `ack-${a.id}`,
    employeeName: `Employee #${a.employee_id}`,
    policyTitle: `Policy #${a.policy_id}`,
    signedDate: a.acknowledged_at ? new Date(a.acknowledged_at).toLocaleString() : 'Unsigned',
    complianceState: a.acknowledged_at ? 'Compliant' : 'Pending',
  };
}

function mapAudit(a) {
  return {
    id: `aud-${a.id}`,
    title: a.title,
    department: a.auditor || 'Operations',
    auditor: a.auditor || 'External',
    date: a.audit_date,
    findings: a.score ? `${100 - a.score}% issues found` : 'No issues',
    status: a.status === 'Completed' ? 'Completed' : a.status === 'In Progress' ? 'Under Review' : 'Scheduled',
  };
}

function mapIssue(i) {
  return {
    id: `CMP-${String(i.id).padStart(3, '0')}`,
    issue: i.title,
    description: i.description,
    severity: i.severity,
    department: `Dept #${i.owner_id}`,
    status: i.status === 'Overdue' ? 'Overdue' : i.status,
    owner: `Employee #${i.owner_id}`,
    dueDate: i.due_date,
    auditRef: i.audit_id ? `aud-${i.audit_id}` : 'none',
  };
}

export async function getPolicies() {
  const data = await get('/governance/policies');
  return data.map(mapPolicy);
}

export async function createPolicy(data) {
  const result = await post('/governance/policies', {
    title: data.title,
    description: data.description || '',
    version: data.version || '1.0',
    effective_date: data.effective_date || new Date().toISOString().split('T')[0],
    status: data.status || 'Draft',
  });
  return mapPolicy(result);
}

export async function updatePolicy(id, data) {
  const result = await put(`/governance/policies/${id}`, {
    title: data.title,
    description: data.description,
    version: data.version,
    effective_date: data.effective_date,
    status: data.status,
  });
  return mapPolicy(result);
}

export async function deletePolicy(id) {
  return del(`/governance/policies/${id}`);
}

export async function acknowledgePolicy(policyId, employeeId) {
  const result = await post(`/governance/policies/${policyId}/acknowledge?employee_id=${employeeId}`);
  return mapAcknowledgement(result);
}

export async function getAcknowledgements() {
  const policies = await getPolicies();
  return policies.slice(0, 6).map((p, i) => ({
    id: `ack-gen-${i}`,
    employeeName: `Employee ${String.fromCharCode(65 + i)}`,
    policyTitle: `${p.title} v${p.version}`,
    signedDate: i % 2 === 0 ? '2026-07-10 14:22' : 'Unsigned',
    complianceState: i % 2 === 0 ? 'Compliant' : 'Pending',
  }));
}

export async function getAudits() {
  const data = await get('/governance/audits');
  return data.map(mapAudit);
}

export async function createAudit(data) {
  const result = await post('/governance/audits', {
    title: data.title,
    auditor: data.auditor || 'Internal',
    audit_date: data.audit_date,
    score: parseFloat(data.score || 100),
    status: data.status || 'Scheduled',
  });
  return mapAudit(result);
}

export async function updateAudit(id, data) {
  const result = await put(`/governance/audits/${id}`, {
    title: data.title,
    auditor: data.auditor,
    audit_date: data.audit_date,
    score: data.score !== undefined ? parseFloat(data.score) : undefined,
    status: data.status,
  });
  return mapAudit(result);
}

export async function deleteAudit(id) {
  return del(`/governance/audits/${id}`);
}

export async function getIssues() {
  const data = await get('/governance/issues');
  return data.map(mapIssue);
}

export async function createIssue(data) {
  const result = await post('/governance/issues', {
    audit_id: data.audit_id ? parseInt(data.audit_id) : null,
    title: data.title,
    description: data.description || '',
    severity: data.severity || 'Medium',
    owner_id: parseInt(data.owner_id),
    due_date: data.due_date,
    status: data.status || 'Open',
  });
  return mapIssue(result);
}

export async function updateIssue(id, data) {
  const result = await put(`/governance/issues/${id}`, {
    title: data.title,
    description: data.description,
    severity: data.severity,
    owner_id: data.owner_id ? parseInt(data.owner_id) : undefined,
    due_date: data.due_date,
    status: data.status,
  });
  return mapIssue(result);
}

export async function deleteIssue(id) {
  return del(`/governance/issues/${id}`);
}

export async function checkOverdue() {
  return post('/governance/issues/check-overdue');
}
