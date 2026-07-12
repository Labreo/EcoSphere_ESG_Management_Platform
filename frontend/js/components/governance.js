/**
 * EcoSphere Governance Module View Component - High Fidelity & Interactive
 */

// Module-level in-memory state persisting across internal tab switching
const state = {
  policies: [
    { id: 'pol-1', title: 'Sustainability Code of Conduct', version: '2.1', status: 'Active', scope: 'Global', description: 'Guides office guidelines regarding single-use plastics, recycling practices, and sustainable commute incentives.', publishedDate: '2026-01-15', acknowledgedCount: 142, totalRequired: 156 },
    { id: 'pol-2', title: 'Responsible Sourcing & Vendor Policy', version: '1.0', status: 'Active', scope: 'Supply Chain', description: 'Mandates environmental standards for vendors, covering Scope 3 footprint logging and fair labor certifications.', publishedDate: '2026-03-02', acknowledgedCount: 78, totalRequired: 83 },
    { id: 'pol-3', title: 'Anti-Bribery & Corruption Policy', version: '3.0', status: 'Active', scope: 'Global', description: 'Rules and regulations for anti-bribery, ethics, compliance and anti-money laundering guidelines across all departments.', publishedDate: '2025-11-10', acknowledgedCount: 149, totalRequired: 156 },
    { id: 'pol-4', title: 'Environmental Health & Safety Guidelines', version: '1.2', status: 'Draft', scope: 'Manufacturing', description: 'EHS guidelines for heavy machinery, waste handling, and emergency response procedures.', publishedDate: '—', acknowledgedCount: 0, totalRequired: 42 }
  ],
  acknowledgements: [
    { id: 'ack-1', employeeName: 'Mark Robinson', policyTitle: 'Sustainability Code of Conduct v2.1', signedDate: '2026-07-10 14:22', complianceState: 'Compliant' },
    { id: 'ack-2', employeeName: 'Sarah Jenkins', policyTitle: 'Sustainability Code of Conduct v2.1', signedDate: '2026-07-09 09:12', complianceState: 'Compliant' },
    { id: 'ack-3', employeeName: 'Michael Cho', policyTitle: 'Responsible Sourcing & Vendor Policy v1.0', signedDate: 'Unsigned', complianceState: 'Pending' },
    { id: 'ack-4', employeeName: 'Aditi Rao', policyTitle: 'Anti-Bribery & Corruption Policy v3.0', signedDate: '2026-07-05 11:30', complianceState: 'Compliant' },
    { id: 'ack-5', employeeName: 'Karan Shah', policyTitle: 'Sustainability Code of Conduct v2.1', signedDate: '2026-07-11 16:45', complianceState: 'Compliant' },
    { id: 'ack-6', employeeName: 'Alice Vance', policyTitle: 'Responsible Sourcing & Vendor Policy v1.0', signedDate: 'Unsigned', complianceState: 'Pending' }
  ],
  audits: [
    { id: 'aud-1', title: 'Q2 Waste Audit', department: 'Manufacturing', auditor: 'S. Nair', date: '2026-06-12', findings: '3 minor issues', status: 'Completed' },
    { id: 'aud-2', title: 'Vendor Compliance Check', department: 'Procurement', auditor: 'R. Iyer', date: '2026-07-01', findings: '1 open issue', status: 'Under Review' },
    { id: 'aud-3', title: 'ISO 14064 Carbon Verification', department: 'Operations', auditor: 'SGS International', date: '2026-06-15', findings: '1 major issue', status: 'Completed' },
    { id: 'aud-4', title: 'Ecovadis Rating Assessment', department: 'Procurement', auditor: 'Ecovadis Group', date: '2026-05-10', findings: 'No issues found', status: 'Completed' }
  ],
  complianceIssues: [
    { id: 'CMP-029', issue: 'Missing MSDS sheets', severity: 'High', department: 'Manufacturing', status: 'Open', owner: 'Bob Sterling', dueDate: '2026-07-01', auditRef: 'aud-1' },
    { id: 'CMP-030', issue: 'Late vendor disclosure', severity: 'Medium', department: 'Procurement', status: 'Resolved', owner: 'Alice Vance', dueDate: '2026-07-05', auditRef: 'aud-2' },
    { id: 'CMP-031', issue: 'Scope 1 fuel logs missing for Q2 fleet', severity: 'High', department: 'Logistics', status: 'Overdue', owner: 'Mark Robinson', dueDate: '2026-07-01', auditRef: 'aud-3' },
    { id: 'CMP-032', issue: 'Alembic database schema mismatches on carbon reports table', severity: 'Low', department: 'Engineering', status: 'Open', owner: 'Sarah Jenkins', dueDate: '2026-07-30', auditRef: 'none' },
    { id: 'CMP-033', issue: 'Improper e-waste recycling disposal', severity: 'Medium', department: 'IT', status: 'Open', owner: 'Sarah Jenkins', dueDate: '2026-07-25', auditRef: 'none' }
  ],
  // Filter settings
  policiesScopeFilter: 'All Scopes',
  policiesSearchQuery: '',
  acksSearchQuery: '',
  acksStatusFilter: 'All Statuses',
  auditsSearchQuery: '',
  complianceSearchQuery: '',
  complianceStatusFilter: 'All Statuses',
  complianceSeverityFilter: 'All Severities'
};

// Current mock date configuration for overdue checking
const SYSTEM_DATE = '2026-07-12';

/**
 * Main render function entry point
 */
export function renderGovernancePage(container, pageKey) {
  if (!pageKey) pageKey = 'policies';

  // Automatically evaluate and update overdue status flags based on current time
  state.complianceIssues.forEach(c => {
    if (c.status !== 'Resolved') {
      if (c.dueDate < SYSTEM_DATE) {
        c.status = 'Overdue';
      } else {
        c.status = 'Open';
      }
    }
  });

  container.innerHTML = `
    <div class="view-container" style="padding-top: 0;">
      
      <!-- Sub Navigation connected tabs row -->
      <div class="sub-nav-tabs gov-sub-nav">
        <a href="#governance/policies" class="sub-nav-tab gov-tab ${pageKey === 'policies' ? 'active' : ''}">
          Policies
        </a>
        <a href="#governance/policy-acknowledgements" class="sub-nav-tab gov-tab ${pageKey === 'policy-acknowledgements' ? 'active' : ''}">
          Policy Acknowledgements
        </a>
        <a href="#governance/audits" class="sub-nav-tab gov-tab ${pageKey === 'audits' ? 'active' : ''}">
          Audits
        </a>
        <a href="#governance/compliance-issues" class="sub-nav-tab gov-tab ${pageKey === 'compliance-issues' ? 'active' : ''}">
          Compliance Issues
        </a>
      </div>

      <!-- Active Section Panel -->
      <div id="governance-section-panel">
        ${renderActiveSectionPanel(pageKey)}
      </div>
    </div>

    <style>${getGovernanceCSS()}</style>
  `;

  // Bind UI Events
  bindActivePanelEvents(container, pageKey);

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Render active panel HTML structure based on tab
 */
function renderActiveSectionPanel(key) {
  switch (key) {
    case 'policies':
      return renderPolicies();
    case 'policy-acknowledgements':
      return renderPolicyAcknowledgements();
    case 'audits':
      return renderAudits();
    case 'compliance-issues':
      return renderComplianceIssues();
    default:
      return `<div class="glass-card">Select a sub-section from the tabs above.</div>`;
  }
}

// ---------------------------------------------------------------------
// 1. ESG POLICIES PANEL
// ---------------------------------------------------------------------
function renderPolicies() {
  const filtered = state.policies.filter(p => {
    const matchesScope = state.policiesScopeFilter === 'All Scopes' || p.scope === state.policiesScopeFilter;
    const matchesSearch = p.title.toLowerCase().includes(state.policiesSearchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(state.policiesSearchQuery.toLowerCase());
    return matchesScope && matchesSearch;
  });

  const cards = filtered.map(p => {
    const pct = p.totalRequired > 0 ? Math.round((p.acknowledgedCount / p.totalRequired) * 100) : 0;
    
    // Check if user (Simulating Mark Robinson) signed this policy
    const isSigned = state.acknowledgements.some(a => 
      a.employeeName === 'Mark Robinson' && a.policyTitle === `${p.title} v${p.version}` && a.signedDate !== 'Unsigned'
    );

    const actionHtml = isSigned
      ? `<span class="status-tag status-tag-active" style="padding: 6px 12px; font-size: 11.5px; border-radius: var(--radius-sm); border: 1px solid var(--accent-success);"><i data-lucide="check-circle" style="width: 14px; height: 14px; margin-right: 4px; display: inline-block; vertical-align: middle;"></i> Acknowledged</span>`
      : `<button class="btn btn-warning btn-mini-act btn-sign-policy" data-id="${p.id}"><i data-lucide="edit-2" style="width: 13px; height: 13px;"></i> Acknowledge</button>`;

    return `
      <div class="glass-card policy-card" id="card-${p.id}">
        <div class="p-card-header">
          <span class="version-tag">Version ${p.version} &bull; <span class="${p.status === 'Active' ? 'active-status-lbl' : 'draft-status-lbl'}">${p.status}</span></span>
          <span class="scope-tag">${p.scope}</span>
        </div>
        <h4 class="policy-title">${p.title}</h4>
        <p class="policy-desc">${p.description}</p>
        
        <div class="ack-progress-container">
          <div class="ack-progress-header">
            <span>Staff Signatures</span>
            <span class="ack-progress-text">${pct}% (${p.acknowledgedCount}/${p.totalRequired})</span>
          </div>
          <div class="ack-progress-bar-bg">
            <div class="ack-progress-bar-fill" style="width: ${pct}%"></div>
          </div>
        </div>

        <div class="policy-footer">
          <div class="meta-item"><i data-lucide="calendar"></i> <span>Published: ${p.publishedDate}</span></div>
          <div class="meta-action">${actionHtml}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="table-actions">
      <div class="filters-row">
        <input type="text" class="table-search" id="policy-search" placeholder="Search policies..." value="${state.policiesSearchQuery}" />
        <select class="filter-dropdown" id="policy-scope-filter">
          <option ${state.policiesScopeFilter === 'All Scopes' ? 'selected' : ''}>All Scopes</option>
          <option ${state.policiesScopeFilter === 'Global' ? 'selected' : ''}>Global</option>
          <option ${state.policiesScopeFilter === 'Manufacturing' ? 'selected' : ''}>Manufacturing</option>
          <option ${state.policiesScopeFilter === 'Supply Chain' ? 'selected' : ''}>Supply Chain</option>
        </select>
      </div>
      <button class="btn btn-purple" id="btn-add-policy"><i data-lucide="plus"></i> Add Policy</button>
    </div>

    ${cards.length > 0 
      ? `<div class="grid-2 fade-in">${cards}</div>` 
      : `<div class="glass-card no-records-card"><i data-lucide="folder-open"></i><p>No ESG policies found matching filters.</p></div>`
    }
  `;
}

// ---------------------------------------------------------------------
// 2. POLICY ACKNOWLEDGEMENTS PANEL
// ---------------------------------------------------------------------
function renderPolicyAcknowledgements() {
  const activePolicies = state.policies.filter(p => p.status === 'Active');
  const totalRequired = activePolicies.reduce((acc, p) => acc + p.totalRequired, 0);
  const totalCompleted = activePolicies.reduce((acc, p) => acc + p.acknowledgedCount, 0);
  const rate = totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 0;

  const filtered = state.acknowledgements.filter(a => {
    const matchesSearch = a.employeeName.toLowerCase().includes(state.acksSearchQuery.toLowerCase()) || 
                          a.policyTitle.toLowerCase().includes(state.acksSearchQuery.toLowerCase());
    const matchesStatus = state.acksStatusFilter === 'All Statuses' || a.complianceState === state.acksStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const rows = filtered.map(a => {
    const dateCell = a.signedDate === 'Unsigned' 
      ? `<span class="unsigned-text">Unsigned</span>` 
      : `<span>${a.signedDate}</span>`;
      
    const statusCell = a.complianceState === 'Compliant'
      ? `<span class="status-tag status-tag-active">Compliant</span>`
      : `<span class="status-tag status-tag-pending">Pending</span>`;

    return `
      <tr>
        <td><strong>${a.employeeName}</strong></td>
        <td>${a.policyTitle}</td>
        <td>${dateCell}</td>
        <td>${statusCell}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="grid-3 mb-24 fade-in">
      <div class="glass-card stat-box border-purple">
        <span class="stat-lbl">Required Staff Signatures</span>
        <h3>${totalRequired}</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Signed / Completed</span>
        <h3>${totalCompleted}</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Completion Rate</span>
        <h3>${rate}%</h3>
      </div>
    </div>

    <div class="view-card fade-in">
      <div class="card-header-with-actions">
        <h3 class="card-section-title">Signature Tracker</h3>
        <div class="table-actions-inline">
          <input type="text" class="table-search" id="ack-search" placeholder="Search employees/policies..." value="${state.acksSearchQuery}" />
          <select class="filter-dropdown" id="ack-status-filter">
            <option ${state.acksStatusFilter === 'All Statuses' ? 'selected' : ''}>All Statuses</option>
            <option ${state.acksStatusFilter === 'Compliant' ? 'selected' : ''}>Compliant</option>
            <option ${state.acksStatusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
          </select>
        </div>
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
            ${rows.length > 0 ? rows : `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No signatures found matching criteria.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------
// 3. GOVERNANCE AUDITS PANEL (Mockup Reference)
// ---------------------------------------------------------------------
function renderAudits() {
  const filteredAudits = state.audits.filter(a => {
    return a.title.toLowerCase().includes(state.auditsSearchQuery.toLowerCase()) || 
           a.auditor.toLowerCase().includes(state.auditsSearchQuery.toLowerCase()) ||
           a.department.toLowerCase().includes(state.auditsSearchQuery.toLowerCase()) ||
           a.findings.toLowerCase().includes(state.auditsSearchQuery.toLowerCase());
  });

  const auditRows = filteredAudits.map(a => {
    let statusCell = '';
    if (a.status === 'Completed') {
      statusCell = `<span class="status-tag-outline status-tag-active">${a.status}</span>`;
    } else if (a.status === 'Under Review') {
      statusCell = `<span class="status-tag-outline status-tag-purple">${a.status}</span>`;
    } else {
      statusCell = `<span class="status-tag-outline status-tag-info">${a.status}</span>`;
    }

    return `
      <tr>
        <td><strong>${a.title}</strong></td>
        <td>${a.department}</td>
        <td>${a.auditor}</td>
        <td>${a.date}</td>
        <td>${a.findings}</td>
        <td>${statusCell}</td>
      </tr>
    `;
  }).join('');

  // Get compliance issues that are raised from audits
  const raisedIssues = state.complianceIssues.filter(c => c.auditRef !== 'none');
  const issueRows = raisedIssues.map(c => {
    let severityClass = 'severity-high';
    if (c.severity === 'Medium') severityClass = 'severity-medium';
    if (c.severity === 'Low') severityClass = 'severity-low';

    let statusCell = '';
    if (c.status === 'Resolved') {
      statusCell = `<span class="status-tag-outline status-tag-active">${c.status}</span>`;
    } else if (c.status === 'Overdue') {
      statusCell = `<span class="status-tag-outline status-tag-danger">${c.status}</span>`;
    } else {
      statusCell = `<span class="status-tag-outline status-tag-pending">${c.status}</span>`;
    }

    return `
      <tr>
        <td>${c.issue}</td>
        <td><span class="severity-badge ${severityClass}">${c.severity}</span></td>
        <td>${c.department}</td>
        <td>${statusCell}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="table-actions">
      <div class="filters-row">
        <input type="text" class="table-search" id="audit-search" placeholder="Search audits..." value="${state.auditsSearchQuery}" />
      </div>
      <div class="button-group">
        <button class="btn btn-purple" id="btn-add-audit"><i data-lucide="plus"></i> New Audit</button>
        <div class="dropdown-wrapper">
          <button class="btn btn-secondary dropdown-trigger" id="btn-export-audit">
            Export <i data-lucide="chevron-down" style="width: 14px; height: 14px; margin-left: 4px; display: inline-block; vertical-align: middle;"></i>
          </button>
          <div class="dropdown-menu" id="export-dropdown-menu">
            <a class="dropdown-item" data-format="csv"><i data-lucide="file-text" style="width: 14px; height: 14px; margin-right: 6px;"></i> CSV Spreadsheet</a>
            <a class="dropdown-item" data-format="excel"><i data-lucide="sheet" style="width: 14px; height: 14px; margin-right: 6px;"></i> Excel Sheet</a>
            <a class="dropdown-item" data-format="pdf"><i data-lucide="file" style="width: 14px; height: 14px; margin-right: 6px;"></i> PDF Document</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Audits Main Register Card -->
    <div class="view-card mb-24 fade-in">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Department</th>
              <th>Auditor</th>
              <th>Date</th>
              <th>Findings</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${auditRows.length > 0 ? auditRows : `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No audits found.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Compliance Issues raised from Audits (Exact mockup layout section) -->
    <div class="section-divider-title fade-in" style="margin-top: 32px; margin-bottom: 12px;">
      Compliance Issues raised from Audits — severity-tagged, resolution tracked
    </div>
    
    <div class="view-card fade-in">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Issue</th>
              <th>Severity</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${issueRows.length > 0 ? issueRows : `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No audit-raised compliance issues found.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------
// 4. COMPLIANCE ISSUES REGISTER PANEL
// ---------------------------------------------------------------------
function renderComplianceIssues() {
  const openCount = state.complianceIssues.filter(c => c.status === 'Open' || c.status === 'Overdue').length;
  const overdueCount = state.complianceIssues.filter(c => c.status === 'Overdue').length;
  const resolvedCount = state.complianceIssues.filter(c => c.status === 'Resolved').length;

  const filtered = state.complianceIssues.filter(c => {
    const matchesSearch = c.issue.toLowerCase().includes(state.complianceSearchQuery.toLowerCase()) || 
                          c.id.toLowerCase().includes(state.complianceSearchQuery.toLowerCase()) ||
                          c.owner.toLowerCase().includes(state.complianceSearchQuery.toLowerCase());
    const matchesSeverity = state.complianceSeverityFilter === 'All Severities' || c.severity === state.complianceSeverityFilter;
    const matchesStatus = state.complianceStatusFilter === 'All Statuses' || c.status === state.complianceStatusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const rows = filtered.map(c => {
    let severityClass = 'severity-high';
    if (c.severity === 'Medium') severityClass = 'severity-medium';
    if (c.severity === 'Low') severityClass = 'severity-low';

    let statusCell = '';
    if (c.status === 'Resolved') {
      statusCell = `<span class="status-tag-outline status-tag-active">${c.status}</span>`;
    } else if (c.status === 'Overdue') {
      statusCell = `<span class="status-tag-outline status-tag-danger">${c.status}</span>`;
    } else {
      statusCell = `<span class="status-tag-outline status-tag-pending">${c.status}</span>`;
    }

    const actionText = c.status === 'Resolved' ? 'Reopen' : 'Resolve';
    
    return `
      <tr>
        <td><strong>${c.id}</strong></td>
        <td>${c.issue}</td>
        <td><span class="severity-badge ${severityClass}">${c.severity}</span></td>
        <td>${c.owner}</td>
        <td>${c.dueDate}</td>
        <td>${statusCell}</td>
        <td class="cell-actions">
          <button class="btn btn-secondary btn-mini-act btn-toggle-resolve" data-id="${c.id}">${actionText}</button>
          <button class="btn btn-secondary btn-mini-act btn-edit-owner" data-id="${c.id}" title="Edit Owner & Due Date"><i data-lucide="user-cog" style="width: 13px; height: 13px;"></i></button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="grid-3 mb-24 fade-in">
      <div class="glass-card stat-box border-danger">
        <span class="stat-lbl">Active/Open Issues</span>
        <h3>${openCount}</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Overdue Issues</span>
        <h3 class="danger-text">${overdueCount}</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Resolved Issues</span>
        <h3>${resolvedCount}</h3>
      </div>
    </div>

    <div class="table-actions">
      <div class="filters-row">
        <input type="text" class="table-search" id="issue-search" placeholder="Search compliance issues..." value="${state.complianceSearchQuery}" />
        <select class="filter-dropdown" id="issue-severity-filter">
          <option ${state.complianceSeverityFilter === 'All Severities' ? 'selected' : ''}>All Severities</option>
          <option ${state.complianceSeverityFilter === 'High' ? 'selected' : ''}>High</option>
          <option ${state.complianceSeverityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
          <option ${state.complianceSeverityFilter === 'Low' ? 'selected' : ''}>Low</option>
        </select>
        <select class="filter-dropdown" id="issue-status-filter">
          <option ${state.complianceStatusFilter === 'All Statuses' ? 'selected' : ''}>All Statuses</option>
          <option ${state.complianceStatusFilter === 'Open' ? 'selected' : ''}>Open</option>
          <option ${state.complianceStatusFilter === 'Overdue' ? 'selected' : ''}>Overdue</option>
          <option ${state.complianceStatusFilter === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
      </div>
      <button class="btn btn-purple" id="btn-add-issue"><i data-lucide="plus"></i> Raise Issue</button>
    </div>

    <div class="view-card fade-in">
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length > 0 ? rows : `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No compliance issues found.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------
// EVENT BINDINGS
// ---------------------------------------------------------------------
function bindActivePanelEvents(container, pageKey) {
  const refresh = () => renderGovernancePage(container, pageKey);

  // General tab click event overrides (to avoid full DOM layout refreshes)
  const tabs = container.querySelectorAll('.gov-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      // Allow hash change router to process
    });
  });

  if (pageKey === 'policies') {
    // Search
    const search = container.querySelector('#policy-search');
    if (search) {
      search.addEventListener('input', (e) => {
        state.policiesSearchQuery = e.target.value;
        const panel = container.querySelector('#governance-section-panel');
        if (panel) panel.innerHTML = renderPolicies();
        bindCardActions();
      });
    }

    // Filter
    const filter = container.querySelector('#policy-scope-filter');
    if (filter) {
      filter.addEventListener('change', (e) => {
        state.policiesScopeFilter = e.target.value;
        refresh();
      });
    }

    // Add button
    const addBtn = container.querySelector('#btn-add-policy');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        showAddPolicyModal(refresh);
      });
    }

    // Sign Policy action
    const bindCardActions = () => {
      const signBtns = container.querySelectorAll('.btn-sign-policy');
      signBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const policy = state.policies.find(p => p.id === id);
          if (policy) {
            showSignPolicyModal(policy, refresh);
          }
        });
      });
    };
    bindCardActions();

  } else if (pageKey === 'policy-acknowledgements') {
    // Search
    const search = container.querySelector('#ack-search');
    if (search) {
      search.addEventListener('input', (e) => {
        state.acksSearchQuery = e.target.value;
        const wrapper = container.querySelector('.data-table tbody');
        if (wrapper) {
          const filtered = state.acknowledgements.filter(a => {
            const matchesSearch = a.employeeName.toLowerCase().includes(state.acksSearchQuery.toLowerCase()) || 
                                  a.policyTitle.toLowerCase().includes(state.acksSearchQuery.toLowerCase());
            const matchesStatus = state.acksStatusFilter === 'All Statuses' || a.complianceState === state.acksStatusFilter;
            return matchesSearch && matchesStatus;
          });
          wrapper.innerHTML = filtered.map(a => `
            <tr>
              <td><strong>${a.employeeName}</strong></td>
              <td>${a.policyTitle}</td>
              <td>${a.signedDate === 'Unsigned' ? `<span class="unsigned-text">Unsigned</span>` : `<span>${a.signedDate}</span>`}</td>
              <td><span class="status-tag ${a.complianceState === 'Compliant' ? 'status-tag-active' : 'status-tag-pending'}">${a.complianceState}</span></td>
            </tr>
          `).join('') || `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No signatures found matching criteria.</td></tr>`;
        }
      });
    }

    // Filter
    const filter = container.querySelector('#ack-status-filter');
    if (filter) {
      filter.addEventListener('change', (e) => {
        state.acksStatusFilter = e.target.value;
        refresh();
      });
    }

  } else if (pageKey === 'audits') {
    // Search
    const search = container.querySelector('#audit-search');
    if (search) {
      search.addEventListener('input', (e) => {
        state.auditsSearchQuery = e.target.value;
        const panel = container.querySelector('#governance-section-panel');
        if (panel) {
          // Re-render only lists to preserve cursor and avoid overlay issues
          const filteredAudits = state.audits.filter(a => {
            return a.title.toLowerCase().includes(state.auditsSearchQuery.toLowerCase()) || 
                   a.auditor.toLowerCase().includes(state.auditsSearchQuery.toLowerCase()) ||
                   a.department.toLowerCase().includes(state.auditsSearchQuery.toLowerCase());
          });
          const auditRows = filteredAudits.map(a => `
            <tr>
              <td><strong>${a.title}</strong></td>
              <td>${a.department}</td>
              <td>${a.auditor}</td>
              <td>${a.date}</td>
              <td>${a.findings}</td>
              <td><span class="status-tag-outline ${a.status === 'Completed' ? 'status-tag-active' : (a.status === 'Under Review' ? 'status-tag-purple' : 'status-tag-info')}">${a.status}</span></td>
            </tr>
          `).join('');
          const tbody = container.querySelector('.view-card:first-of-type tbody');
          if (tbody) tbody.innerHTML = auditRows || `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No audits found.</td></tr>`;
        }
      });
    }

    // Add button
    const addBtn = container.querySelector('#btn-add-audit');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        showAddAuditModal(refresh);
      });
    }

    // Export button
    const exportBtn = container.querySelector('#btn-export-audit');
    const exportMenu = container.querySelector('#export-dropdown-menu');
    if (exportBtn && exportMenu) {
      exportBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        exportMenu.classList.remove('show');
      });

      const items = exportMenu.querySelectorAll('.dropdown-item');
      items.forEach(item => {
        item.addEventListener('click', (e) => {
          const format = e.currentTarget.getAttribute('data-format');
          triggerExport(format);
        });
      });
    }

  } else if (pageKey === 'compliance-issues') {
    // Search
    const search = container.querySelector('#issue-search');
    if (search) {
      search.addEventListener('input', (e) => {
        state.complianceSearchQuery = e.target.value;
        const tbody = container.querySelector('.view-card tbody');
        if (tbody) {
          const filtered = state.complianceIssues.filter(c => {
            const matchesSearch = c.issue.toLowerCase().includes(state.complianceSearchQuery.toLowerCase()) || 
                                  c.id.toLowerCase().includes(state.complianceSearchQuery.toLowerCase()) ||
                                  c.owner.toLowerCase().includes(state.complianceSearchQuery.toLowerCase());
            const matchesSeverity = state.complianceSeverityFilter === 'All Severities' || c.severity === state.complianceSeverityFilter;
            const matchesStatus = state.complianceStatusFilter === 'All Statuses' || c.status === state.complianceStatusFilter;
            return matchesSearch && matchesSeverity && matchesStatus;
          });
          tbody.innerHTML = filtered.map(c => `
            <tr>
              <td><strong>${c.id}</strong></td>
              <td>${c.issue}</td>
              <td><span class="severity-badge ${c.severity === 'High' ? 'severity-high' : (c.severity === 'Medium' ? 'severity-medium' : 'severity-low')}">${c.severity}</span></td>
              <td>${c.owner}</td>
              <td>${c.dueDate}</td>
              <td><span class="status-tag-outline ${c.status === 'Resolved' ? 'status-tag-active' : (c.status === 'Overdue' ? 'status-tag-danger' : 'status-tag-pending')}">${c.status}</span></td>
              <td class="cell-actions">
                <button class="btn btn-secondary btn-mini-act btn-toggle-resolve" data-id="${c.id}">${c.status === 'Resolved' ? 'Reopen' : 'Resolve'}</button>
                <button class="btn btn-secondary btn-mini-act btn-edit-owner" data-id="${c.id}"><i data-lucide="user-cog" style="width: 13px; height: 13px;"></i></button>
              </td>
            </tr>
          `).join('') || `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No compliance issues found.</td></tr>`;
          
          if (window.lucide) window.lucide.createIcons();
          bindRegisterActions();
        }
      });
    }

    // Filters
    const severityFilter = container.querySelector('#issue-severity-filter');
    if (severityFilter) {
      severityFilter.addEventListener('change', (e) => {
        state.complianceSeverityFilter = e.target.value;
        refresh();
      });
    }

    const statusFilter = container.querySelector('#issue-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        state.complianceStatusFilter = e.target.value;
        refresh();
      });
    }

    // Add Issue button
    const addIssueBtn = container.querySelector('#btn-add-issue');
    if (addIssueBtn) {
      addIssueBtn.addEventListener('click', () => {
        showAddIssueModal(refresh);
      });
    }

    // Register table actions (Resolve & Edit Owner)
    const bindRegisterActions = () => {
      // Toggle status (Open/Resolved)
      const resolveBtns = container.querySelectorAll('.btn-toggle-resolve');
      resolveBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const issue = state.complianceIssues.find(c => c.id === id);
          if (issue) {
            if (issue.status === 'Resolved') {
              issue.status = issue.dueDate < SYSTEM_DATE ? 'Overdue' : 'Open';
              showToast(`Compliance issue ${id} reopened successfully.`, 'info');
            } else {
              issue.status = 'Resolved';
              showToast(`Compliance issue ${id} marked as Resolved.`, 'success');
            }
            refresh();
          }
        });
      });

      // Edit Owner
      const editBtns = container.querySelectorAll('.btn-edit-owner');
      editBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const issue = state.complianceIssues.find(c => c.id === id);
          if (issue) {
            showEditOwnerModal(issue, refresh);
          }
        });
      });
    };
    bindRegisterActions();
  }
}

// ---------------------------------------------------------------------
// HIGH FIDELITY INTERACTION MODALS
// ---------------------------------------------------------------------

/**
 * Add Policy Modal
 */
function showAddPolicyModal(onSave) {
  createModal({
    title: 'Add New ESG Policy',
    bodyHtml: `
      <form id="gov-modal-form" class="modal-form-grid">
        <div class="form-group">
          <label for="p-title">Policy Title</label>
          <input type="text" id="p-title" name="title" required placeholder="e.g. Sustainable Commute Guidelines" />
        </div>
        <div class="form-row">
          <div class="form-group flex-1">
            <label for="p-version">Version</label>
            <input type="text" id="p-version" name="version" required placeholder="e.g. 1.0" value="1.0" />
          </div>
          <div class="form-group flex-1" style="margin-left: 12px;">
            <label for="p-scope">Scope</label>
            <select id="p-scope" name="scope" class="form-select">
              <option>Global</option>
              <option>Manufacturing</option>
              <option>Supply Chain</option>
              <option>Operations</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="p-desc">Description</label>
          <textarea id="p-desc" name="description" rows="3" required placeholder="Outline guidelines, expectations, and reporting obligations..."></textarea>
        </div>
        <div class="modal-footer-btns">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-purple">Publish Policy</button>
        </div>
      </form>
    `,
    onSubmit: (data) => {
      const newPolicy = {
        id: `pol-${state.policies.length + 1}`,
        title: data.title,
        version: data.version,
        status: 'Active',
        scope: data.scope,
        description: data.description,
        publishedDate: SYSTEM_DATE,
        acknowledgedCount: 0,
        totalRequired: data.scope === 'Global' ? 156 : (data.scope === 'Manufacturing' ? 42 : 83)
      };

      state.policies.push(newPolicy);

      // Create a few pending acknowledgements for simulation
      state.acknowledgements.push(
        { id: `ack-sim-${Date.now()}-1`, employeeName: 'Mark Robinson', policyTitle: `${data.title} v${data.version}`, signedDate: 'Unsigned', complianceState: 'Pending' },
        { id: `ack-sim-${Date.now()}-2`, employeeName: 'Alice Vance', policyTitle: `${data.title} v${data.version}`, signedDate: 'Unsigned', complianceState: 'Pending' }
      );

      showToast(`ESG Policy "${data.title}" published successfully.`, 'success');
      onSave();
    }
  });
}

/**
 * Sign/Acknowledge Policy Modal with cursive handwriting signature preview!
 */
function showSignPolicyModal(policy, onSave) {
  createModal({
    title: 'Acknowledge ESG Policy Document',
    bodyHtml: `
      <div class="policy-sign-details">
        <h4 style="font-family: var(--font-heading); color: var(--text-primary); margin-bottom: 8px;">${policy.title}</h4>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
          ${policy.description}
        </p>
        <div class="compliance-declaration-box">
          <p><strong>Declaration of Agreement:</strong> I hereby confirm that I have read, understood, and agreed to comply with this ESG policy document and its obligations.</p>
        </div>
        <form id="gov-modal-form" class="modal-form-grid" style="margin-top: 16px;">
          <div class="form-group">
            <label for="sig-name">Type Full Name to Sign</label>
            <input type="text" id="sig-name" name="sigName" required value="Mark Robinson" placeholder="e.g. Mark Robinson" />
          </div>
          
          <div class="signature-preview-area">
            <div class="sig-preview-label">Handwritten Signature Preview</div>
            <div class="sig-cursive-font" id="sig-cursive-preview">Mark Robinson</div>
          </div>

          <div class="modal-footer-btns">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-purple">Confirm Signature</button>
          </div>
        </form>
      </div>
    `,
    onMount: (modalEl) => {
      const input = modalEl.querySelector('#sig-name');
      const preview = modalEl.querySelector('#sig-cursive-preview');
      if (input && preview) {
        input.addEventListener('input', (e) => {
          preview.textContent = e.target.value || 'Signature';
        });
      }
    },
    onSubmit: (data) => {
      // Update acknowledgement state
      const pTitleWithVer = `${policy.title} v${policy.version}`;
      let ack = state.acknowledgements.find(a => a.employeeName === data.sigName && a.policyTitle === pTitleWithVer);
      
      if (!ack) {
        ack = {
          id: `ack-${Date.now()}`,
          employeeName: data.sigName,
          policyTitle: pTitleWithVer,
          signedDate: `${SYSTEM_DATE} 10:26`,
          complianceState: 'Compliant'
        };
        state.acknowledgements.push(ack);
      } else {
        ack.signedDate = `${SYSTEM_DATE} 10:26`;
        ack.complianceState = 'Compliant';
      }

      // Increment policy counter
      policy.acknowledgedCount = Math.min(policy.totalRequired, policy.acknowledgedCount + 1);

      showToast(`Acknowledged "${policy.title}" successfully. Signature logged.`, 'success');
      onSave();
    }
  });
}

/**
 * Log Audit Modal
 */
function showAddAuditModal(onSave) {
  createModal({
    title: 'Log New Governance Audit',
    bodyHtml: `
      <form id="gov-modal-form" class="modal-form-grid">
        <div class="form-group">
          <label for="a-title">Audit Title / Reference</label>
          <input type="text" id="a-title" name="title" required placeholder="e.g. Q3 Social & Labor Audit" />
        </div>
        <div class="form-row">
          <div class="form-group flex-1">
            <label for="a-dept">Department</label>
            <select id="a-dept" name="department" class="form-select">
              <option>Manufacturing</option>
              <option>Procurement</option>
              <option>Operations</option>
              <option>Logistics</option>
              <option>Human Resources</option>
            </select>
          </div>
          <div class="form-group flex-1" style="margin-left: 12px;">
            <label for="a-auditor">Auditor / Body</label>
            <input type="text" id="a-auditor" name="auditor" required placeholder="e.g. SGS / Bureau Veritas" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group flex-1">
            <label for="a-date">Audit Date</label>
            <input type="date" id="a-date" name="date" required value="${SYSTEM_DATE}" />
          </div>
          <div class="form-group flex-1" style="margin-left: 12px;">
            <label for="a-status">Audit Status</label>
            <select id="a-status" name="status" class="form-select">
              <option>Completed</option>
              <option>Under Review</option>
              <option>Scheduled</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="a-findings">Initial Findings</label>
          <input type="text" id="a-findings" name="findings" required placeholder="e.g. 2 minor issues raised, fully compliant" />
        </div>
        
        <div class="compliance-auto-trigger-banner">
          <i data-lucide="info" style="width: 16px; height: 16px; color: var(--accent-warning); flex-shrink: 0; margin-top: 2px;"></i>
          <p>Logging findings with "issue" or "violation" will automatically create a compliance register draft issue.</p>
        </div>

        <div class="modal-footer-btns">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-purple">Log Audit</button>
        </div>
      </form>
    `,
    onSubmit: (data) => {
      const auditId = `aud-${state.audits.length + 1}`;
      const newAudit = {
        id: auditId,
        title: data.title,
        department: data.department,
        auditor: data.auditor,
        date: data.date,
        findings: data.findings,
        status: data.status
      };

      state.audits.push(newAudit);

      // Auto-trigger a compliance issue if findings mention issues
      const containsIssues = data.findings.toLowerCase().includes('issue') || data.findings.toLowerCase().includes('violation');
      if (containsIssues) {
        const issueId = `CMP-0${30 + state.complianceIssues.length}`;
        state.complianceIssues.push({
          id: issueId,
          issue: `Audit finding: ${data.findings} during ${data.title}`,
          severity: 'Medium',
          department: data.department,
          status: 'Open',
          owner: 'Pending Assignment',
          dueDate: SYSTEM_DATE,
          auditRef: auditId
        });
        showToast(`Audit logged. Raised linked compliance issue ${issueId}.`, 'warning');
      } else {
        showToast(`Audit "${data.title}" successfully logged.`, 'success');
      }
      onSave();
    }
  });
}

/**
 * Raise Compliance Issue Modal
 */
function showAddIssueModal(onSave) {
  createModal({
    title: 'Raise Governance Compliance Issue',
    bodyHtml: `
      <form id="gov-modal-form" class="modal-form-grid">
        <div class="form-group">
          <label for="c-desc">Issue Description</label>
          <input type="text" id="c-desc" name="issue" required placeholder="e.g. Scope 3 supply chain logistics log files missing" />
        </div>
        <div class="form-row">
          <div class="form-group flex-1">
            <label for="c-severity">Severity</label>
            <select id="c-severity" name="severity" class="form-select">
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <div class="form-group flex-1" style="margin-left: 12px;">
            <label for="c-dept">Department</label>
            <select id="c-dept" name="department" class="form-select">
              <option>Manufacturing</option>
              <option>Procurement</option>
              <option>Operations</option>
              <option>Logistics</option>
              <option>IT</option>
              <option>Engineering</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group flex-1">
            <label for="c-owner">Owner (Assigned Manager)</label>
            <input type="text" id="c-owner" name="owner" required placeholder="e.g. Bob Sterling" />
          </div>
          <div class="form-group flex-1" style="margin-left: 12px;">
            <label for="c-due">Due Date</label>
            <input type="date" id="c-due" name="dueDate" required value="${SYSTEM_DATE}" />
          </div>
        </div>
        <div class="modal-footer-btns">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-purple">Raise Issue</button>
        </div>
      </form>
    `,
    onSubmit: (data) => {
      const issueId = `CMP-0${30 + state.complianceIssues.length}`;
      
      const newIssue = {
        id: issueId,
        issue: data.issue,
        severity: data.severity,
        department: data.department,
        status: data.dueDate < SYSTEM_DATE ? 'Overdue' : 'Open',
        owner: data.owner,
        dueDate: data.dueDate,
        auditRef: 'none'
      };

      state.complianceIssues.push(newIssue);
      showToast(`Compliance issue ${issueId} registered & flagged.`, 'success');
      onSave();
    }
  });
}

/**
 * Edit Owner and Due Date Modal
 */
function showEditOwnerModal(issue, onSave) {
  createModal({
    title: `Assign Owner & Deadline: ${issue.id}`,
    bodyHtml: `
      <form id="gov-modal-form" class="modal-form-grid">
        <div class="form-group">
          <label>Issue Details</label>
          <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 13px; color: var(--text-secondary);">
            ${issue.issue}
          </div>
        </div>
        <div class="form-group">
          <label for="c-owner">Owner Name</label>
          <input type="text" id="c-owner" name="owner" required value="${issue.owner}" />
        </div>
        <div class="form-group">
          <label for="c-due">Due Date</label>
          <input type="date" id="c-due" name="dueDate" required value="${issue.dueDate}" />
        </div>
        <div class="modal-footer-btns">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-purple">Save Assignment</button>
        </div>
      </form>
    `,
    onSubmit: (data) => {
      issue.owner = data.owner;
      issue.dueDate = data.dueDate;
      
      if (issue.status !== 'Resolved') {
        issue.status = data.dueDate < SYSTEM_DATE ? 'Overdue' : 'Open';
      }

      showToast(`Compliance issue ${issue.id} owner and deadline updated.`, 'success');
      onSave();
    }
  });
}

/**
 * Base modal wrapper utility
 */
function createModal({ title, bodyHtml, onSubmit, onMount }) {
  // Remove existing modal elements
  const existing = document.querySelector('.gov-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'gov-modal-overlay';
  overlay.innerHTML = `
    <div class="gov-modal-container">
      <div class="gov-modal-header">
        <h3>${title}</h3>
        <button id="btn-close-modal"><i data-lucide="x"></i></button>
      </div>
      <div class="gov-modal-body">
        ${bodyHtml}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const closeModal = () => {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 150);
  };

  // Close bindings
  overlay.querySelector('#btn-close-modal').addEventListener('click', closeModal);
  const cancelBtn = overlay.querySelector('#btn-cancel-modal');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Click outside to dismiss (light dismiss fallback)
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Form submit handling
  const form = overlay.querySelector('#gov-modal-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      onSubmit(data);
      closeModal();
    });
  }

  // Trigger optional mount script
  if (onMount) {
    onMount(overlay);
  }
}

// ---------------------------------------------------------------------
// EXPORT SIMULATION
// ---------------------------------------------------------------------
function triggerExport(format) {
  if (format === 'csv') {
    const csvHeaders = ['Title', 'Department', 'Auditor', 'Date', 'Findings', 'Status'];
    const csvRows = state.audits.map(a => [a.title, a.department, a.auditor, a.date, a.findings, a.status].map(val => `"${val}"`).join(','));
    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
    downloadDataFile('governance_audits_report.csv', csvContent, 'text/csv');
    showToast('Downloaded CSV audits sheet.', 'success');
  } 
  else if (format === 'excel') {
    const tabHeaders = ['Title', 'Department', 'Auditor', 'Date', 'Findings', 'Status'];
    const tabRows = state.audits.map(a => [a.title, a.department, a.auditor, a.date, a.findings, a.status].join('\t'));
    const tabContent = [tabHeaders.join('\t'), ...tabRows].join('\n');
    downloadDataFile('governance_audits_report.xls', tabContent, 'application/vnd.ms-excel');
    showToast('Downloaded Excel XML sheet.', 'success');
  } 
  else if (format === 'pdf') {
    let report = 'ECOSPHERE ESG PLATFORM - GOVERNANCE AUDITS REPORT\n';
    report += `Generated at: ${SYSTEM_DATE} 10:26\n`;
    report += '===================================================\n\n';
    state.audits.forEach(a => {
      report += `Audit Title  : ${a.title}\n`;
      report += `Department   : ${a.department}\n`;
      report += `Auditor      : ${a.auditor}\n`;
      report += `Date         : ${a.date}\n`;
      report += `Findings     : ${a.findings}\n`;
      report += `Status       : ${a.status}\n`;
      report += '---------------------------------------------------\n';
    });
    downloadDataFile('governance_audits_report.txt', report, 'text/plain');
    showToast('Downloaded PDF audit documentation.', 'success');
  }
}

function downloadDataFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------
// TOAST NOTIFICATIONS POPUP
// ---------------------------------------------------------------------
function showToast(message, type = 'success') {
  const existing = document.querySelectorAll('.gov-toast');
  existing.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `gov-toast gov-toast-${type}`;
  
  let icon = 'check-circle';
  if (type === 'warning') icon = 'alert-triangle';
  if (type === 'info') icon = 'info';

  toast.innerHTML = `
    <i data-lucide="${icon}" class="toast-icon"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Trigger slide-in
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Slide out and remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ---------------------------------------------------------------------
// STYLING SPECIFICATION (CSS TOKENS & OVERLAY DESIGNS)
// ---------------------------------------------------------------------
function getGovernanceCSS() {
  return `
    /* Connected Rounded Pills Subnavigation */
    .gov-sub-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 10px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 14px;
      width: 100%;
    }
    .gov-tab {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 9px 18px;
      background: var(--bg-card);
      color: var(--text-secondary);
      font-family: var(--font-heading);
      font-weight: 500;
      font-size: 13.5px;
      text-decoration: none;
      cursor: pointer;
      border: 1px solid var(--border-color) !important;
      border-radius: var(--radius-full) !important;
      transition: all var(--transition-fast);
      margin-right: 0px !important;
    }
    .gov-tab:hover {
      background: rgba(255, 255, 255, 0.02);
      border-color: var(--border-hover) !important;
      color: var(--text-primary);
    }
    .gov-tab.active {
      background-color: var(--accent-warning) !important;
      color: #ffffff !important;
      border-color: var(--accent-warning) !important;
    }

    /* Actions bar & filtering */
    .table-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
      margin-top: 8px;
      width: 100%;
    }
    .filters-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .table-search {
      flex: 1;
      max-width: 320px;
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 16px;
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: 14px;
      outline: none;
      transition: all var(--transition-fast);
    }
    .table-search:focus {
      border-color: var(--accent-warning);
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.15);
    }
    .filter-dropdown {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 16px;
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: 14px;
      outline: none;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .filter-dropdown:focus {
      border-color: var(--accent-warning);
    }
    
    .button-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Standardized Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border: none;
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 13.5px;
      cursor: pointer;
      transition: all var(--transition-fast);
      color: white;
      white-space: nowrap;
    }
    .btn-purple {
      background-color: var(--accent-warning);
    }
    .btn-purple:hover {
      background-color: #7c3aed;
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
    }
    .btn-warning {
      background-color: transparent;
      border: 1px solid var(--accent-warning);
      color: var(--accent-warning);
    }
    .btn-warning:hover {
      background-color: var(--accent-warning);
      color: white;
    }
    .btn-secondary {
      background-color: rgba(255, 255, 255, 0.04);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }
    .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: var(--text-primary);
      border-color: var(--border-hover);
    }
    .btn-mini-act {
      padding: 5px 10px;
      font-size: 11.5px;
      border-radius: var(--radius-sm);
      gap: 4px;
    }

    /* Policies cards layout */
    .policy-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
    }
    .p-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .version-tag {
      font-size: 11.5px;
      color: var(--text-muted);
      font-weight: 500;
    }
    .active-status-lbl {
      color: var(--accent-success);
      font-weight: 600;
    }
    .draft-status-lbl {
      color: var(--accent-gamification);
      font-weight: 600;
    }
    .scope-tag {
      background-color: rgba(139, 92, 246, 0.1);
      color: #a78bfa;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: var(--radius-full);
      border: 1px solid rgba(139, 92, 246, 0.2);
    }
    .policy-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.2px;
    }
    .policy-desc {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
      flex: 1;
    }

    /* Signature Progress Bar */
    .ack-progress-container {
      margin-top: 4px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ack-progress-header {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      font-weight: 500;
      color: var(--text-muted);
    }
    .ack-progress-bar-bg {
      width: 100%;
      height: 6px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .ack-progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-warning), #a78bfa);
      border-radius: var(--radius-full);
      transition: width var(--transition-normal);
    }

    .policy-footer {
      border-top: 1px solid var(--border-color);
      padding-top: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .meta-item i {
      width: 14px;
      height: 14px;
    }

    /* Grid & Cards Utilities */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .mb-24 { margin-bottom: 24px; }
    .no-records-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 60px 24px;
      text-align: center;
      color: var(--text-muted);
    }
    .no-records-card i {
      width: 48px;
      height: 48px;
      opacity: 0.5;
    }

    /* Stat Box Cards */
    .stat-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 20px 24px;
    }
    .stat-lbl {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
    }
    .stat-box h3 {
      font-family: var(--font-heading);
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .border-purple { border-color: rgba(139, 92, 246, 0.2); }
    .border-danger { border-color: rgba(239, 68, 68, 0.2); }
    .danger-text { color: var(--accent-danger) !important; }

    /* Tables & Card Structures */
    .view-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 0;
      overflow: hidden;
      width: 100%;
    }
    .card-header-with-actions {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .card-section-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 600;
    }
    .table-actions-inline {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .table-actions-inline .table-search {
      max-width: 240px;
      padding: 8px 12px;
      font-size: 13px;
    }
    .table-actions-inline .filter-dropdown {
      padding: 8px 12px;
      font-size: 13px;
    }

    .table-wrapper {
      overflow-x: auto;
      width: 100%;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .data-table th, .data-table td {
      padding: 14px 20px;
      border-bottom: 1px solid var(--border-color);
      font-size: 13.5px;
    }
    .data-table th {
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background-color: rgba(255,255,255,0.01);
    }
    .data-table tr:hover td {
      background-color: rgba(255,255,255,0.01);
    }
    .data-table tr:last-child td {
      border-bottom: none;
    }
    
    .cell-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Outlined Tags & Badges matching mockup */
    .status-tag {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 700;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    .status-tag-active {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--accent-success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .status-tag-pending {
      background-color: rgba(245, 158, 11, 0.1);
      color: var(--accent-gamification);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    
    .status-tag-outline {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      background-color: transparent;
      border: 1px solid currentColor;
      letter-spacing: 0.2px;
    }
    .status-tag-outline.status-tag-active {
      color: #10B981;
    }
    .status-tag-outline.status-tag-danger {
      color: #EF4444;
    }
    .status-tag-outline.status-tag-pending {
      color: #F59E0B;
    }
    .status-tag-outline.status-tag-purple {
      color: #a78bfa;
    }
    .status-tag-outline.status-tag-info {
      color: #3B82F6;
    }

    .severity-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.2px;
      display: inline-block;
      border: 1px solid currentColor;
    }
    .severity-high {
      color: #EF4444;
      background-color: rgba(239, 68, 68, 0.04);
    }
    .severity-medium {
      color: #F59E0B;
      background-color: rgba(245, 158, 11, 0.04);
    }
    .severity-low {
      color: #3B82F6;
      background-color: rgba(59, 130, 246, 0.04);
    }
    .unsigned-text {
      color: var(--text-muted);
      font-style: italic;
    }

    /* Section divider title matching mockup */
    .section-divider-title {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 600;
      color: var(--text-secondary);
      border-left: 3px solid var(--accent-warning);
      padding-left: 10px;
    }

    /* Dropdown Trigger & Menus */
    .dropdown-wrapper {
      position: relative;
      display: inline-block;
    }
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 150;
      display: none;
      flex-direction: column;
      min-width: 170px;
      overflow: hidden;
    }
    .dropdown-menu.show {
      display: flex;
    }
    .dropdown-item {
      padding: 10px 16px;
      font-size: 13px;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all var(--transition-fast);
      text-decoration: none;
    }
    .dropdown-item:hover {
      background-color: rgba(255, 255, 255, 0.03);
      color: var(--text-primary);
    }

    /* Premium interactive modals */
    .gov-modal-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeInOverlay 0.15s ease-out forwards;
    }
    .gov-modal-container {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      width: 90%;
      max-width: 500px;
      box-shadow: var(--shadow-lg);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      animation: slideInModal 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .gov-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 12px;
    }
    .gov-modal-header h3 {
      font-family: var(--font-heading);
      font-size: 19px;
      font-weight: 600;
      color: var(--text-primary);
    }
    #btn-close-modal {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
    }
    #btn-close-modal:hover {
      color: var(--text-primary);
    }
    #btn-close-modal i {
      width: 20px;
      height: 20px;
    }

    /* Modal Forms */
    .modal-form-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-row {
      display: flex;
      width: 100%;
    }
    .flex-1 { flex: 1; }
    .form-group label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
    }
    .form-group input, .form-group textarea, .form-group select {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: 14px;
      outline: none;
      transition: all var(--transition-fast);
      width: 100%;
    }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      border-color: var(--accent-warning);
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.2);
    }
    .form-select {
      cursor: pointer;
    }
    .modal-footer-btns {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
      border-top: 1px solid var(--border-color);
      padding-top: 16px;
    }

    /* Cursive Signature box */
    .policy-sign-details {
      display: flex;
      flex-direction: column;
    }
    .compliance-declaration-box {
      background-color: rgba(139, 92, 246, 0.05);
      border: 1px solid rgba(139, 92, 246, 0.15);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      font-size: 12.5px;
      line-height: 1.5;
      color: var(--text-secondary);
    }
    .signature-preview-area {
      background-color: rgba(255, 255, 255, 0.01);
      border: 1px dashed var(--border-color);
      border-radius: var(--radius-md);
      padding: 14px;
      text-align: center;
      margin-top: 6px;
    }
    .sig-preview-label {
      font-size: 10px;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .sig-cursive-font {
      font-family: 'Dancing Script', 'Brush Script MT', cursive;
      font-size: 26px;
      color: #a78bfa;
      letter-spacing: 1px;
      min-height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .compliance-auto-trigger-banner {
      display: flex;
      gap: 10px;
      background: rgba(245, 158, 11, 0.04);
      border: 1px solid rgba(245, 158, 11, 0.15);
      padding: 10px 12px;
      border-radius: var(--radius-md);
      font-size: 12px;
      line-height: 1.4;
      color: var(--text-secondary);
    }

    /* Toast Notification styles */
    .gov-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--accent-warning);
      border-radius: var(--radius-md);
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: var(--shadow-lg);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1100;
    }
    .gov-toast.show {
      transform: translateY(0);
      opacity: 1;
    }
    .gov-toast-success {
      border-left-color: var(--accent-success);
    }
    .gov-toast-warning {
      border-left-color: var(--accent-gamification);
    }
    .gov-toast-info {
      border-left-color: var(--accent-info);
    }
    .toast-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      color: inherit;
    }

    /* Animations */
    .fade-in {
      animation: fadeInAnimation 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .fade-out {
      animation: fadeOutAnimation 0.15s ease-in forwards;
    }
    @keyframes fadeInAnimation {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOutAnimation {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(8px); }
    }
    @keyframes fadeInOverlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInModal {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
}
