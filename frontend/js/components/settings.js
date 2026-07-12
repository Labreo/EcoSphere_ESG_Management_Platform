import * as api from '../api/settings.js';
import { showToast, renderLoading } from '../api/toast.js';
import { getStoredUser } from '../api/auth.js';

export async function renderSettingsPage(container, pageKey) {
  renderLoading(container);

  let contentHtml = '';
  try {
    if (pageKey === 'departments') {
      contentHtml = await renderDepartments();
    } else if (pageKey === 'categories') {
      contentHtml = await renderCategories();
    } else if (pageKey === 'esg-configuration') {
      contentHtml = await renderESGConfiguration();
    } else if (pageKey === 'notification-settings') {
      contentHtml = await renderNotificationSettings();
    }
  } catch (err) {
    showToast('Failed to load settings: ' + err.message, 'error');
    contentHtml = '<div class="error-container"><p>Failed to load data.</p></div>';
  }

  const settingsPageTitles = {
    'departments': 'Departments', 'categories': 'Categories',
    'esg-configuration': 'ESG Configuration', 'notification-settings': 'Notifications'
  };

  container.innerHTML = `
    <div class="view-container">
      <div class="breadcrumb">
        <a href="#dashboard">Dashboard</a>
        <span class="breadcrumb-sep">›</span>
        <a href="#settings/departments">Settings</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">${settingsPageTitles[pageKey] || 'Settings'}</span>
      </div>
      <div class="sub-nav-tabs settings">
        <a href="#settings/departments" class="sub-nav-tab ${pageKey === 'departments' ? 'active' : ''}"><i data-lucide="building"></i> Departments</a>
        <a href="#settings/categories" class="sub-nav-tab ${pageKey === 'categories' ? 'active' : ''}"><i data-lucide="tags"></i> Categories</a>
        <a href="#settings/esg-configuration" class="sub-nav-tab ${pageKey === 'esg-configuration' ? 'active' : ''}"><i data-lucide="sliders"></i> ESG Configuration</a>
        <a href="#settings/notification-settings" class="sub-nav-tab ${pageKey === 'notification-settings' ? 'active' : ''}"><i data-lucide="bell"></i> Notifications</a>
      </div>
      ${contentHtml}
    </div>
  `;

  if (pageKey === 'esg-configuration') bindConfigEvents(container);
  if (pageKey === 'notification-settings') bindNotificationEvents(container);
  if (window.lucide) window.lucide.createIcons();
}

const MOCK_DEPTS = [
  { id: '1', name: 'Corporate', code: 'CORP', head: 'Alice Vance', parent_department_id: null, employee_count: 10, status: 'Active' },
  { id: '2', name: 'Manufacturing', code: 'MFG', head: 'Bob Sterling', parent_department_id: null, employee_count: 25, status: 'Active' },
  { id: '3', name: 'Logistics', code: 'LOG', head: 'Mark Robinson', parent_department_id: null, employee_count: 15, status: 'Active' },
  { id: '4', name: 'Research & Development', code: 'RND', head: 'Dr. Sarah Chen', parent_department_id: null, employee_count: 12, status: 'Active' },
  { id: '5', name: 'Sales', code: 'SALES', head: 'James Wilson', parent_department_id: null, employee_count: 8, status: 'Active' },
  { id: '6', name: 'Human Resources', code: 'HR', head: 'Priya Sharma', parent_department_id: null, employee_count: 6, status: 'Active' },
];
const MOCK_CATS = [
  { id: '1', name: 'Office Carbon Reduction', type: 'Challenge Category', count: 2, status: 'Active' },
  { id: '2', name: 'Community Outreach', type: 'CSR Category', count: 3, status: 'Active' },
  { id: '3', name: 'Renewable Transition', type: 'Challenge Category', count: 1, status: 'Active' },
  { id: '4', name: 'Office Green', type: 'Challenge Category', count: 2, status: 'Active' },
  { id: '5', name: 'Transport', type: 'Challenge Category', count: 1, status: 'Active' },
  { id: '6', name: 'Electricity', type: 'Challenge Category', count: 1, status: 'Active' },
  { id: '7', name: 'Health & Wellness', type: 'CSR Category', count: 1, status: 'Active' },
  { id: '8', name: 'Education', type: 'CSR Category', count: 1, status: 'Active' },
];

async function renderDepartments() {
  let depts;
  try {
    depts = await api.getDepartments();
  } catch (e) {
    depts = MOCK_DEPTS;
  }
  const rows = depts.map(d => `
    <tr>
      <td><strong>${d.name}</strong></td>
      <td>${d.code}</td>
      <td>${d.head}</td>
      <td>${d.parent_department_id ? 'Dept #' + d.parent_department_id : '\u2014'}</td>
      <td>${d.employee_count}</td>
      <td><span class="status-tag ${d.status === 'Active' ? 'status-tag-active' : 'status-tag-pending'}">${d.status}</span></td>
    </tr>
  `).join('');

  return `
    <div class="table-actions">
      <input type="text" class="table-search" placeholder="Search departments..." />
      <button class="btn btn-secondary" id="btn-add-dept"><i data-lucide="plus"></i> Add Department</button>
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
            ${rows || '<tr><td colspan="6">No departments found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    <style>${getSettingsCSS()}</style>
  `;
}

async function renderCategories() {
  let cats;
  try {
    cats = await api.getCategories();
  } catch (e) {
    cats = MOCK_CATS;
  }
  const rows = cats.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.type}</td>
      <td>${c.count} linked</td>
      <td><span class="status-tag ${c.status === 'Active' ? 'status-tag-active' : 'status-tag-pending'}">${c.status}</span></td>
    </tr>
  `).join('');

  return `
    <div class="table-actions">
      <input type="text" class="table-search" placeholder="Search categories..." />
      <button class="btn btn-secondary" id="btn-add-cat"><i data-lucide="plus"></i> Add Category</button>
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
            ${rows || '<tr><td colspan="4">No categories found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    <style>${getSettingsCSS()}</style>
  `;
}

async function renderESGConfiguration() {
  let config = { auto_emission_calculation: true, evidence_requirement: true, badge_auto_award: true, environmental_weight: 40, social_weight: 30, governance_weight: 30 };
  try {
    config = await api.getConfig();
  } catch (e) { /* use defaults */ }

  return `
    <div class="grid-2">
      <div class="glass-card config-options">
        <h3 class="config-card-title">Core Business Rules</h3>
        <div class="switch-group">
          <div class="switch-item">
            <div class="switch-info">
              <strong>Auto Emission Calculation</strong>
              <p>When enabled, Carbon Transactions are automatically parsed from ERP records via linked factors.</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" class="cfg-toggle" data-key="auto_emission_calculation" ${config.auto_emission_calculation ? 'checked' : ''} />
              <span class="slider"></span>
            </label>
          </div>
          <div class="switch-item">
            <div class="switch-info">
              <strong>Evidence Requirement Rule</strong>
              <p>When enabled, employee CSR activity approvals block if proof file URLs are null.</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" class="cfg-toggle" data-key="evidence_requirement" ${config.evidence_requirement ? 'checked' : ''} />
              <span class="slider"></span>
            </label>
          </div>
          <div class="switch-item">
            <div class="switch-info">
              <strong>Badge Auto-Award System</strong>
              <p>When enabled, Badges are assigned to employees dynamically when XP threshold satisfies unlock rules.</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" class="cfg-toggle" data-key="badge_auto_award" ${config.badge_auto_award ? 'checked' : ''} />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="glass-card weights-setup">
        <h3 class="config-card-title">ESG Reporting Weights</h3>
        <p class="config-desc">Define the weighting ratio used when compiling overall organization ESG rating formulas.</p>
        <form class="weights-form" id="weights-form">
          <div class="form-group">
            <label>Environmental Weight (%)</label>
            <input type="number" name="environmental_weight" class="form-input" value="${Math.round(config.environmental_weight * 100)}" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>Social Weight (%)</label>
            <input type="number" name="social_weight" class="form-input" value="${Math.round(config.social_weight * 100)}" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>Governance Weight (%)</label>
            <input type="number" name="governance_weight" class="form-input" value="${Math.round(config.governance_weight * 100)}" min="0" max="100" />
          </div>
          <button type="submit" class="btn btn-save-config">Save Configurations</button>
        </form>
      </div>
    </div>
    <style>${getSettingsCSS()}</style>
  `;
}

function getEventType(row) {
  const types = ['compliance_issue', 'approval_decision', 'policy_reminder', 'badge_unlock'];
  return types[row];
}

async function renderNotificationSettings() {
  let prefs = [];
  try {
    prefs = await api.getNotificationPreferences();
  } catch (e) { /* use defaults */ }

  const defaultPrefs = [
    { event_type: 'compliance_issue', in_app: true, email: true },
    { event_type: 'approval_decision', in_app: true, email: false },
    { event_type: 'policy_reminder', in_app: false, email: true },
    { event_type: 'badge_unlock', in_app: true, email: false },
  ];
  if (!prefs.length) prefs = defaultPrefs;

  const labels = ['New compliance issue raised', 'CSR/Challenge approval decisions', 'Policy acknowledgement reminders', 'Badge achievements unlocked'];

  const rows = labels.map((label, i) => {
    const p = prefs.find(x => x.event_type === getEventType(i)) || defaultPrefs[i];
    return `
      <tr>
        <td><strong>${label}</strong></td>
        <td><input type="checkbox" class="pref-inapp" data-event="${getEventType(i)}" ${p.in_app ? 'checked' : ''} /></td>
        <td><input type="checkbox" class="pref-email" data-event="${getEventType(i)}" ${p.email ? 'checked' : ''} /></td>
      </tr>
    `;
  }).join('');

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
            ${rows}
          </tbody>
        </table>
      </div>
      <button type="button" class="btn btn-save-config" id="btn-save-notif-prefs" style="margin-top: 20px;">Save Alert Preferences</button>
    </div>
    <style>${getSettingsCSS()}</style>
  `;
}

function bindConfigEvents(container) {
  const weightsForm = container.querySelector('#weights-form');
  if (weightsForm) {
    weightsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      try {
        await api.updateConfig({
          environmental_weight: parseFloat(data.environmental_weight) / 100,
          social_weight: parseFloat(data.social_weight) / 100,
          governance_weight: parseFloat(data.governance_weight) / 100,
        });
        showToast('Configuration saved successfully.', 'success');
      } catch (err) {
        showToast('Failed to save config: ' + err.message, 'error');
      }
    });
  }

  const toggles = container.querySelectorAll('.cfg-toggle');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const key = e.target.getAttribute('data-key');
      const value = e.target.checked;
      try {
        await api.updateConfig({ [key]: value });
        showToast(`${key.replace(/_/g, ' ')} updated.`, 'success');
      } catch (err) {
        showToast('Failed to update: ' + err.message, 'error');
        e.target.checked = !value;
      }
    });
  });
}

function bindNotificationEvents(container) {
  const saveBtn = container.querySelector('#btn-save-notif-prefs');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const rows = container.querySelectorAll('tr');
      const preferences = [];
      const eventTypes = ['compliance_issue', 'approval_decision', 'policy_reminder', 'badge_unlock'];
      eventTypes.forEach(et => {
        const inAppCheckbox = container.querySelector(`.pref-inapp[data-event="${et}"]`);
        const emailCheckbox = container.querySelector(`.pref-email[data-event="${et}"]`);
        if (inAppCheckbox && emailCheckbox) {
          preferences.push({
            event_type: et,
            in_app: inAppCheckbox.checked,
            email: emailCheckbox.checked,
          });
        }
      });
      try {
        await api.saveNotificationPreferences(preferences);
        showToast('Alert preferences saved successfully.', 'success');
      } catch (err) {
        showToast('Failed to save preferences: ' + err.message, 'error');
      }
    });
  }
}

function getSettingsCSS() {
  return `
    .table-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; margin-top: 8px; }
    .table-search { flex: 1; max-width: 350px; background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 16px; color: var(--text-primary); font-size: 14px; }
    .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border: none; border-radius: var(--radius-md); font-weight: 600; font-size: 13.5px; cursor: pointer; transition: background-color var(--transition-fast); color: white; }
    .btn-secondary { background-color: rgba(255,255,255,0.05); color: var(--text-primary); border: 1px solid var(--border-color); }
    .btn-secondary:hover { background-color: rgba(255,255,255,0.1); }
    .btn-save-config { background-color: var(--accent-primary); color: white; }
    .btn-save-config:hover { background-color: #2563eb; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 14px 16px; border-bottom: 1px solid var(--border-color); font-size: 14px; }
    .data-table th { color: var(--text-secondary); font-weight: 600; font-size: 12px; text-transform: uppercase; }
    .config-card-title { font-family: var(--font-heading); font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    .config-desc { font-size: 13.5px; color: var(--text-secondary); margin-bottom: 20px; }
    .switch-group { display: flex; flex-direction: column; gap: 20px; }
    .switch-item { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
    .switch-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .switch-info strong { font-size: 14px; color: var(--text-primary); }
    .switch-info p { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
    .toggle-switch { position: relative; display: inline-block; width: 46px; height: 24px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.08); transition: .3s; border-radius: var(--radius-full); border: 1px solid var(--border-color); }
    .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: var(--text-primary); transition: .3s; border-radius: 50%; }
    input:checked + .slider { background-color: var(--accent-primary); }
    input:checked + .slider:before { transform: translateX(22px); }
    .weights-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
    .form-input { background-color: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 12px; color: var(--text-primary); font-size: 13.5px; width: 100%; }
    .form-input:focus { outline: none; border-color: var(--accent-primary); }
    .status-tag { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-full); }
    .status-tag-active { background-color: rgba(16, 185, 129, 0.1); color: var(--accent-success); }
    .status-tag-pending { background-color: rgba(255, 255, 255, 0.05); color: var(--text-secondary); }
  `;
}
