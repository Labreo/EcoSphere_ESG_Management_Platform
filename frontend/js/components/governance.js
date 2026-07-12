/**
 * EcoSphere Governance Module View Component
 */

export function renderGovernancePage(container, pageKey) {
  let contentHtml = '';

  if (pageKey === 'policies') {
    contentHtml = renderPolicies();
  } else if (pageKey === 'policy-acknowledgements') {
    contentHtml = renderPolicyAcknowledgements();
  } else if (pageKey === 'audits') {
    contentHtml = renderAudits();
  } else if (pageKey === 'compliance-issues') {
    contentHtml = renderComplianceIssues();
  }

  container.innerHTML = `
    <div class="view-container">
      <div class="view-header">
        <h1 class="view-title">${getGovernanceTitle(pageKey)}</h1>
        <p class="view-description">${getGovernanceDesc(pageKey)}</p>
      </div>
      ${contentHtml}
    </div>
  `;
}

function getGovernanceTitle(key) {
  switch (key) {
    case 'policies': return 'ESG Policies';
    case 'policy-acknowledgements': return 'Policy Acknowledgements';
    case 'audits': return 'Governance Audits';
    case 'compliance-issues': return 'Compliance Issues';
    default: return 'Governance';
  }
}

function getGovernanceDesc(key) {
  switch (key) {
    case 'policies': return 'Create, publish, and scope compliance and code-of-conduct guidelines for your organization.';
    case 'policy-acknowledgements': return 'Track which staff members have signed and agreed to active company policies.';
    case 'audits': return 'Manage third-party certifications, internal processes, and carbon reporting verification details.';
    case 'compliance-issues': return 'Track regulatory concerns, reporting failures, or violations, including owners and resolutions.';
    default: return 'Configure and manage your organization\'s governance and policies.';
  }
}

// ----------------------------------------------------
// Page Renders
// ----------------------------------------------------

function renderPolicies() {
  return `
    <div class="table-actions">
      <div class="filters-row">
        <select class="filter-dropdown">
          <option>All Scopes</option>
          <option>Global (All Staff)</option>
          <option>Manufacturing Only</option>
          <option>Supply Chain</option>
        </select>
      </div>
      <button class="btn btn-purple"><i data-lucide="plus"></i> Add Policy</button>
    </div>

    <div class="grid-2">
      <div class="glass-card policy-card">
        <div class="p-card-header">
          <span class="version-tag">Version 2.1 &bull; Active</span>
          <span class="scope-tag">Global</span>
        </div>
        <h4 class="policy-title">Sustainability Code of Conduct</h4>
        <p class="policy-desc">Guides office guidelines regarding single-use plastics, recycling practices, and sustainable commute incentives.</p>
        <div class="policy-footer">
          <div class="meta-item"><i data-lucide="calendar"></i> <span>Published: Jan 15, 2026</span></div>
          <div class="meta-item"><i data-lucide="users-round"></i> <span>88% Acknowledged</span></div>
        </div>
      </div>

      <div class="glass-card policy-card">
        <div class="p-card-header">
          <span class="version-tag">Version 1.0 &bull; Active</span>
          <span class="scope-tag">Supply Chain</span>
        </div>
        <h4 class="policy-title">Responsible Sourcing & Vendor Policy</h4>
        <p class="policy-desc">Mandates environmental standards for vendors, covering Scope 3 footprint logging and fair labor certifications.</p>
        <div class="policy-footer">
          <div class="meta-item"><i data-lucide="calendar"></i> <span>Published: Mar 02, 2026</span></div>
          <div class="meta-item"><i data-lucide="users-round"></i> <span>94% Acknowledged</span></div>
        </div>
      </div>
    </div>

    <style>${getGovernanceCSS()}</style>
  `;
}

function renderPolicyAcknowledgements() {
  return `
    <div class="grid-3">
      <div class="glass-card stat-box border-purple">
        <span class="stat-lbl">Required Staff Signatures</span>
        <h3>156</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Signed / Completed</span>
        <h3>142</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Completion Rate</span>
        <h3>91%</h3>
      </div>
    </div>

    <div class="view-card">
      <div class="card-header">
        <h3>Signature Tracker</h3>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Policy Document</th>
              <th>Signed Date</th>
              <th>Compliance State</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Mark Robinson</strong></td>
              <td>Sustainability Code of Conduct v2.1</td>
              <td>2026-07-10 14:22</td>
              <td><span class="status-tag status-tag-active">Compliant</span></td>
            </tr>
            <tr>
              <td><strong>Sarah Jenkins</strong></td>
              <td>Sustainability Code of Conduct v2.1</td>
              <td>2026-07-09 09:12</td>
              <td><span class="status-tag status-tag-active">Compliant</span></td>
            </tr>
            <tr>
              <td><strong>Michael Cho</strong></td>
              <td>Responsible Sourcing & Vendor Policy v1.0</td>
              <td><span class="unsigned-text">Unsigned</span></td>
              <td><span class="status-tag status-tag-pending">Pending</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style>${getGovernanceCSS()}</style>
  `;
}

function renderAudits() {
  return `
    <div class="table-actions">
      <div class="filters-row">
        <input type="text" class="table-search" placeholder="Search audit logs..." />
      </div>
      <button class="btn btn-purple"><i data-lucide="plus"></i> Log Audit</button>
    </div>

    <div class="view-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Audit Reference</th>
              <th>Auditor / Body</th>
              <th>Scope</th>
              <th>Date</th>
              <th>Findings (Open/Closed)</th>
              <th>Verification File</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>AUD-2026-01</strong></td>
              <td>SGS International</td>
              <td>ISO 14064 (Carbon footprint verification)</td>
              <td>2026-06-15</td>
              <td><strong>1 / 3</strong></td>
              <td><a href="#" class="proof-link"><i data-lucide="file-check"></i> iso_14064_report.pdf</a></td>
            </tr>
            <tr>
              <td><strong>AUD-2026-02</strong></td>
              <td>Ecovadis Rating Group</td>
              <td>Corporate Sustainability Assessment</td>
              <td>2026-05-10</td>
              <td><strong>0 / 1</strong></td>
              <td><a href="#" class="proof-link"><i data-lucide="file-check"></i> ecovadis_scorecard.pdf</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style>${getGovernanceCSS()}</style>
  `;
}

function renderComplianceIssues() {
  return `
    <div class="grid-3">
      <div class="glass-card stat-box border-danger">
        <span class="stat-lbl">Active/Open Issues</span>
        <h3>1</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Overdue Issues</span>
        <h3 class="danger-text">1</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Resolved Issues</span>
        <h3>14</h3>
      </div>
    </div>

    <div class="view-card">
      <div class="card-header">
        <h3>Compliance Register</h3>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Issue Ref</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Owner</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>CMP-029</strong></td>
              <td>Logistics diesel fleet Scope 1 fuel logs missing for Q2.</td>
              <td><span class="severity-badge severity-high">High</span></td>
              <td>Bob Sterling (Logistics Head)</td>
              <td>2026-07-01</td>
              <td><span class="status-tag status-tag-danger">Overdue</span></td>
              <td><button class="btn btn-secondary btn-mini-act">Update Owner</button></td>
            </tr>
            <tr>
              <td><strong>CMP-030</strong></td>
              <td>Alembic database schema mismatches on carbon reports table.</td>
              <td><span class="severity-badge severity-medium">Medium</span></td>
              <td>Sarah Jenkins (Tech Lead)</td>
              <td>2026-07-30</td>
              <td><span class="status-tag status-tag-pending">Open</span></td>
              <td><button class="btn btn-secondary btn-mini-act">Update Owner</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style>${getGovernanceCSS()}</style>
  `;
}

function getGovernanceCSS() {
  return `
    /* Actions and Table */
    .table-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
      margin-top: 8px;
    }
    .filters-row {
      flex: 1;
    }
    .filter-dropdown {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 16px;
      color: var(--text-primary);
      font-size: 14px;
    }
    .table-search {
      flex: 1;
      max-width: 350px;
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 16px;
      color: var(--text-primary);
      font-size: 14px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 13.5px;
      cursor: pointer;
      transition: background-color var(--transition-fast);
      color: white;
    }
    .btn-purple {
      background-color: var(--accent-warning);
    }
    .btn-purple:hover {
      background-color: #7c3aed;
    }
    .btn-secondary {
      background-color: rgba(255,255,255,0.05);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    .btn-mini-act {
      padding: 6px 12px;
      font-size: 12px;
    }

    /* Policies cards */
    .policy-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .p-card-header {
      display: flex;
      justify-content: space-between;
    }
    .version-tag {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
    }
    .scope-tag {
      background-color: rgba(139, 92, 246, 0.15);
      color: var(--accent-warning);
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .policy-title {
      font-family: var(--font-heading);
      font-size: 17px;
      font-weight: 600;
    }
    .policy-desc {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .policy-footer {
      border-top: 1px solid var(--border-color);
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .meta-item i {
      width: 14px;
      height: 14px;
      color: var(--text-muted);
    }

    /* Stat Box border info */
    .stat-box {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .stat-lbl {
      font-size: 12px;
      color: var(--text-secondary);
    }
    .stat-box h3 {
      font-family: var(--font-heading);
      font-size: 24px;
      font-weight: 700;
    }
    .border-purple {
      border-color: rgba(139, 92, 246, 0.2);
    }
    .border-danger {
      border-color: rgba(239, 68, 68, 0.2);
    }
    .unsigned-text {
      color: var(--text-muted);
      font-style: italic;
    }

    /* Submissions review table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th, .data-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color);
      font-size: 14px;
    }
    .data-table th {
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }
    .proof-link {
      color: var(--accent-warning);
      text-decoration: none;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .proof-link:hover {
      text-decoration: underline;
    }

    /* Compliance styles */
    .danger-text {
      color: var(--accent-danger);
    }
    .status-tag-danger {
      background-color: rgba(239, 68, 68, 0.1);
      color: var(--accent-danger);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .severity-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
    }
    .severity-high {
      background-color: rgba(239, 68, 68, 0.15);
      color: var(--accent-danger);
    }
    .severity-medium {
      background-color: rgba(245, 158, 11, 0.15);
      color: var(--accent-gamification);
    }
  `;
}
