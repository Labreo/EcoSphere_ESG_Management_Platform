/**
 * EcoSphere Settings Module View Component
 */

export function renderSettingsPage(container, pageKey) {
  let contentHtml = '';

  if (pageKey === 'departments') {
    contentHtml = renderDepartments();
  } else if (pageKey === 'categories') {
    contentHtml = renderCategories();
  } else if (pageKey === 'esg-configuration') {
    contentHtml = renderESGConfiguration();
  } else if (pageKey === 'notification-settings') {
    contentHtml = renderNotificationSettings();
  }

  container.innerHTML = `
    <div class="view-container">
      <div class="sub-nav-tabs settings">
        <a href="#settings/departments" class="sub-nav-tab ${pageKey === 'departments' ? 'active' : ''}">Departments</a>
        <a href="#settings/categories" class="sub-nav-tab ${pageKey === 'categories' ? 'active' : ''}">Categories</a>
        <a href="#settings/esg-configuration" class="sub-nav-tab ${pageKey === 'esg-configuration' ? 'active' : ''}">ESG Configuration</a>
        <a href="#settings/notification-settings" class="sub-nav-tab ${pageKey === 'notification-settings' ? 'active' : ''}">Notifications</a>
      </div>
      ${contentHtml}
    </div>
  `;
}

function getSettingsTitle(key) {
  switch (key) {
    case 'departments': return 'Departments';
    case 'categories': return 'Categories';
    case 'esg-configuration': return 'ESG Core Configuration';
    case 'notification-settings': return 'Notification Settings';
    default: return 'Settings';
  }
}

function getSettingsDesc(key) {
  switch (key) {
    case 'departments': return 'Manage organizational hierarchy, department heads, and track employee counts across nodes.';
    case 'categories': return 'Manage shared taxonomies used across CSR activities and gamified challenges.';
    case 'esg-configuration': return 'Configure core calculations, score weighting distributions, and auto-calculation rules.';
    case 'notification-settings': return 'Select events that trigger in-app messages or email alerts to employees and admins.';
    default: return 'Configure settings and preferences.';
  }
}

// ----------------------------------------------------
// Page Renders
// ----------------------------------------------------

function renderDepartments() {
  return `
    <div class="table-actions">
      <input type="text" class="table-search" placeholder="Search departments..." />
      <button class="btn btn-secondary"><i data-lucide="plus"></i> Add Department</button>
    </div>

    <div class="view-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Dept Name</th>
              <th>Dept Code</th>
              <th>Head of Department</th>
              <th>Parent Node</th>
              <th>Employee Count</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Product Design & R&D</strong></td>
              <td>RD-02</td>
              <td>Sarah Jenkins</td>
              <td>Operations</td>
              <td>42</td>
              <td><span class="status-tag status-tag-active">Active</span></td>
            </tr>
            <tr>
              <td><strong>Finance & Operations</strong></td>
              <td>FIN-01</td>
              <td>Jane Doe</td>
              <td>Corporate Board</td>
              <td>18</td>
              <td><span class="status-tag status-tag-active">Active</span></td>
            </tr>
            <tr>
              <td><strong>Logistics & Supply Chain</strong></td>
              <td>LSC-04</td>
              <td>Bob Sterling</td>
              <td>Operations</td>
              <td>96</td>
              <td><span class="status-tag status-tag-active">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style>${getSettingsCSS()}</style>
  `;
}

function renderCategories() {
  return `
    <div class="table-actions">
      <input type="text" class="table-search" placeholder="Search categories..." />
      <button class="btn btn-secondary"><i data-lucide="plus"></i> Add Category</button>
    </div>

    <div class="view-card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Taxonomy Type</th>
              <th>Linked Activities / Challenges</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Office Carbon Reduction</strong></td>
              <td>Challenge Category</td>
              <td>4 Challenges linked</td>
              <td><span class="status-tag status-tag-active">Active</span></td>
            </tr>
            <tr>
              <td><strong>Community Outreach</strong></td>
              <td>CSR Category</td>
              <td>8 Activities linked</td>
              <td><span class="status-tag status-tag-active">Active</span></td>
            </tr>
            <tr>
              <td><strong>Renewable Transition</strong></td>
              <td>Challenge Category</td>
              <td>2 Challenges linked</td>
              <td><span class="status-tag status-tag-active">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style>${getSettingsCSS()}</style>
  `;
}

function renderESGConfiguration() {
  return `
    <div class="grid-2">
      <!-- Config Variables -->
      <div class="glass-card config-options">
        <h3 class="config-card-title">Core Business Rules</h3>
        <div class="switch-group">
          <div class="switch-item">
            <div class="switch-info">
              <strong>Auto Emission Calculation</strong>
              <p>When enabled, Carbon Transactions are automatically parsed from ERP records via linked factors.</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked />
              <span class="slider"></span>
            </label>
          </div>

          <div class="switch-item">
            <div class="switch-info">
              <strong>Evidence Requirement Rule</strong>
              <p>When enabled, employee CSR activity approvals block if proof file URLs are null.</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked />
              <span class="slider"></span>
            </label>
          </div>

          <div class="switch-item">
            <div class="switch-info">
              <strong>Badge Auto-Award System</strong>
              <p>When enabled, Badges are assigned to employees dynamically when XP threshold satisfies unlock rules.</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Weights Formulas -->
      <div class="glass-card weights-setup">
        <h3 class="config-card-title">ESG Reporting Weights</h3>
        <p class="config-desc">Define the weighting ratio used when compiling overall organization ESG rating formulas.</p>
        
        <form class="weights-form">
          <div class="form-group">
            <label>Environmental Weight (%)</label>
            <input type="number" class="form-input" value="40" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>Social Weight (%)</label>
            <input type="number" class="form-input" value="30" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>Governance Weight (%)</label>
            <input type="number" class="form-input" value="30" min="0" max="100" />
          </div>
          <button type="button" class="btn btn-save-config">Save Configurations</button>
        </form>
      </div>
    </div>

    <style>${getSettingsCSS()}</style>
  `;
}

function renderNotificationSettings() {
  return `
    <div class="view-card">
      <h3 class="config-card-title">Alert Subscriptions</h3>
      <p class="config-desc">Enable which notification paths (In-App or Email) should trigger when operations log events.</p>
      
      <div class="notif-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Trigger Notification Event</th>
              <th>In-App Notification</th>
              <th>Email Notification</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>New compliance issue raised</strong></td>
              <td><input type="checkbox" checked /></td>
              <td><input type="checkbox" checked /></td>
            </tr>
            <tr>
              <td><strong>CSR/Challenge approval decisions</strong></td>
              <td><input type="checkbox" checked /></td>
              <td><input type="checkbox" /></td>
            </tr>
            <tr>
              <td><strong>Policy acknowledgement reminders</strong></td>
              <td><input type="checkbox" /></td>
              <td><input type="checkbox" checked /></td>
            </tr>
            <tr>
              <td><strong>Badge achievements unlocked</strong></td>
              <td><input type="checkbox" checked /></td>
              <td><input type="checkbox" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="button" class="btn btn-save-config" style="margin-top: 20px;">Save Alert Preferences</button>
    </div>

    <style>${getSettingsCSS()}</style>
  `;
}

function getSettingsCSS() {
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
    .btn-secondary {
      background-color: rgba(255,255,255,0.05);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    .btn-secondary:hover {
      background-color: rgba(255,255,255,0.1);
    }
    .btn-save-config {
      background-color: var(--accent-primary);
      color: white;
    }
    .btn-save-config:hover {
      background-color: #2563eb;
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

    /* Config and sliders */
    .config-card-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .config-desc {
      font-size: 13.5px;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }
    .switch-group {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .switch-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
    }
    .switch-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .switch-info strong {
      font-size: 14px;
      color: var(--text-primary);
    }
    .switch-info p {
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 46px;
      height: 24px;
      flex-shrink: 0;
    }
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255,255,255,0.08);
      transition: .3s;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-color);
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background-color: var(--text-primary);
      transition: .3s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: var(--accent-primary);
    }
    input:checked + .slider:before {
      transform: translateX(22px);
    }

    /* Weights setup */
    .weights-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .form-input {
      background-color: rgba(0,0,0,0.2);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      color: var(--text-primary);
      font-size: 13.5px;
      width: 100%;
    }
    .form-input:focus {
      outline: none;
      border-color: var(--accent-primary);
    }
  `;
}
