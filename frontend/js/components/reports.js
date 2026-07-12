/**
 * EcoSphere Reports Module View Component
 */

export function renderReportsPage(container, pageKey) {
  let contentHtml = '';

  if (pageKey === 'environmental-report') {
    contentHtml = renderModuleReport('Environmental', 'env-fill', 'co2');
  } else if (pageKey === 'social-report') {
    contentHtml = renderModuleReport('Social', 'soc-fill', 'users');
  } else if (pageKey === 'governance-report') {
    contentHtml = renderModuleReport('Governance', 'gov-fill', 'shield');
  } else if (pageKey === 'esg-summary') {
    contentHtml = renderESGSummary();
  } else if (pageKey === 'custom-report-builder') {
    contentHtml = renderCustomReportBuilder();
  }

  container.innerHTML = `
    <div class="view-container">
      <div class="view-header">
        <h1 class="view-title">${getReportsTitle(pageKey)}</h1>
        <p class="view-description">${getReportsDesc(pageKey)}</p>
      </div>
      ${contentHtml}
    </div>
  `;
}

function getReportsTitle(key) {
  switch (key) {
    case 'environmental-report': return 'Environmental Report';
    case 'social-report': return 'Social Report';
    case 'governance-report': return 'Governance Report';
    case 'esg-summary': return 'ESG Summary Report';
    case 'custom-report-builder': return 'Custom Report Builder';
    default: return 'Reports';
  }
}

function getReportsDesc(key) {
  switch (key) {
    case 'environmental-report': return 'Detailed metrics on Scope 1, 2, and 3 carbon emissions, fuel consumption, and goal completion rates.';
    case 'social-report': return 'Comprehensive audit on corporate social responsibility projects, employee engagement rates, and diversity metrics.';
    case 'governance-report': return 'Detailed compliance index logging policies signatures, audits outcomes, and active compliance violations.';
    case 'esg-summary': return 'Weighted compilation of Environmental, Social, and Governance performance across your organizational structure.';
    case 'custom-report-builder': return 'Aggregate and export customized ESG data by selecting filters, date boundaries, and department scopes.';
    default: return 'Generate and export report files.';
  }
}

// ----------------------------------------------------
// Page Renders
// ----------------------------------------------------

function renderModuleReport(moduleName, fillClass, iconName) {
  return `
    <div class="table-actions">
      <div class="filters-row">
        <select class="filter-dropdown">
          <option>Q3 2026 (Current)</option>
          <option>Q2 2026</option>
          <option>Full Year 2025</option>
        </select>
      </div>
      <div class="btn-group">
        <button class="btn btn-report"><i data-lucide="download"></i> Export PDF</button>
        <button class="btn btn-secondary"><i data-lucide="sheet"></i> CSV</button>
      </div>
    </div>

    <div class="grid-3">
      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>Overall Module Rating</span>
          <i data-lucide="${iconName}"></i>
        </div>
        <h3>Grade A-</h3>
        <p class="text-secondary">Performance is in the top 15% of industry peers.</p>
      </div>
      
      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>Completion vs Goals</span>
        </div>
        <h3>78.2%</h3>
        <div class="progress-track" style="height: 6px; margin: 8px 0;">
          <div class="progress-fill ${fillClass}" style="width: 78%;"></div>
        </div>
      </div>

      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>Data Audit State</span>
        </div>
        <h3 class="success-text"><i data-lucide="check-circle-2"></i> Verified</h3>
        <p class="text-secondary">Last audited by SGS International on 2026-06-15.</p>
      </div>
    </div>

    <div class="view-card">
      <div class="card-header">
        <h3>Report Summary Details</h3>
      </div>
      <div class="report-summary-text">
        <p>This report highlights the performance trends for the <strong>${moduleName}</strong> module. All logs have been collected from ERP pipelines and voluntary submissions, cross-referenced with config values, and compiled under standard guidelines.</p>
        <p style="margin-top: 10px;">Please use the export buttons above to download a print-ready PDF containing the full charts, individual department score cards, and raw audit log registers.</p>
      </div>
    </div>

    <style>${getReportsCSS()}</style>
  `;
}

function renderESGSummary() {
  return `
    <div class="table-actions">
      <span class="text-secondary">Summary compiled on: July 12, 2026</span>
      <button class="btn btn-report"><i data-lucide="download"></i> Export ESG Package</button>
    </div>

    <div class="grid-3">
      <div class="glass-card esg-metric-score">
        <h4>Environmental Score</h4>
        <div class="radial-circle score-green">82</div>
        <span class="weight-lbl">Weight: 40%</span>
      </div>
      <div class="glass-card esg-metric-score">
        <h4>Social Score</h4>
        <div class="radial-circle score-blue">76</div>
        <span class="weight-lbl">Weight: 30%</span>
      </div>
      <div class="glass-card esg-metric-score">
        <h4>Governance Score</h4>
        <div class="radial-circle score-purple">91</div>
        <span class="weight-lbl">Weight: 30%</span>
      </div>
    </div>

    <div class="view-card">
      <div class="card-header">
        <h3>Departmental Weight Contribution</h3>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Env Score</th>
              <th>Soc Score</th>
              <th>Gov Score</th>
              <th>Weighted Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Product Design & R&D</td>
              <td>86</td>
              <td>82</td>
              <td>94</td>
              <td><strong>87.2</strong></td>
            </tr>
            <tr>
              <td>Finance & Operations</td>
              <td>78</td>
              <td>74</td>
              <td>88</td>
              <td><strong>79.8</strong></td>
            </tr>
            <tr>
              <td>Logistics & Supply Chain</td>
              <td>64</td>
              <td>72</td>
              <td>91</td>
              <td><strong>74.5</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style>${getReportsCSS()}</style>
  `;
}

function renderCustomReportBuilder() {
  return `
    <div class="grid-3">
      <!-- Builder Panel -->
      <div class="glass-card builder-form-wrapper" style="grid-column: span 1;">
        <h3 class="form-title">Filter Selection</h3>
        <form class="action-form">
          <div class="form-group">
            <label>Department Scope</label>
            <select class="form-input">
              <option>All Departments</option>
              <option>Product Design & R&D</option>
              <option>Finance & Operations</option>
              <option>Logistics & Supply Chain</option>
            </select>
          </div>
          <div class="form-group">
            <label>Module Focus</label>
            <select class="form-input">
              <option>All Modules (Summary)</option>
              <option>Environmental (Carbon & Goals)</option>
              <option>Social (CSR & Diversity)</option>
              <option>Governance (Policies & Audits)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date Range</label>
            <select class="form-input">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div class="form-group">
            <label>Include Fields</label>
            <div class="checkbox-group">
              <label class="checkbox-lbl"><input type="checkbox" checked /> Calculated CO2e</label>
              <label class="checkbox-lbl"><input type="checkbox" checked /> Employee XP Scores</label>
              <label class="checkbox-lbl"><input type="checkbox" /> Compliance Incidents</label>
            </div>
          </div>
          <button type="button" class="btn btn-report full-width">Compile Custom Report</button>
        </form>
      </div>

      <!-- Preview Registry -->
      <div class="view-card" style="grid-column: span 2;">
        <div class="card-header">
          <h3>Custom Compiled Preview</h3>
          <button class="btn btn-secondary btn-mini-act"><i data-lucide="download"></i> Download CSV</button>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Dept</th>
                <th>Category</th>
                <th>Indicator Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-07-12</td>
                <td>Logistics HQ</td>
                <td>Environmental</td>
                <td>Grid Electricity Emission</td>
                <td>4.21 tCO2e</td>
              </tr>
              <tr>
                <td>2026-07-11</td>
                <td>Design & R&D</td>
                <td>Social</td>
                <td>Mark Robinson Beach Clean-up</td>
                <td>300 XP</td>
              </tr>
              <tr>
                <td>2026-07-10</td>
                <td>Finance & Ops</td>
                <td>Governance</td>
                <td>Sustainability Code Signatures</td>
                <td>91% Complete</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <style>${getReportsCSS()}</style>
  `;
}

function getReportsCSS() {
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
    .btn-report {
      background-color: var(--text-primary);
      color: var(--bg-primary);
    }
    .btn-report:hover {
      background-color: var(--text-secondary);
    }
    .btn-secondary {
      background-color: rgba(255,255,255,0.05);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    .btn-secondary:hover {
      background-color: rgba(255,255,255,0.1);
    }
    .btn-group {
      display: flex;
      gap: 8px;
    }
    .btn-mini-act {
      padding: 6px 12px;
      font-size: 12px;
    }
    .full-width {
      width: 100%;
      justify-content: center;
    }

    /* Module report card */
    .module-report-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      justify-content: center;
    }
    .m-card-hdr {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .module-report-card h3 {
      font-family: var(--font-heading);
      font-size: 24px;
      font-weight: 700;
    }
    .progress-track {
      height: 8px;
      width: 100%;
      background-color: rgba(255,255,255,0.05);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: var(--radius-full);
    }
    .env-fill { background: linear-gradient(90deg, #10B981, #059669); }
    .soc-fill { background: linear-gradient(90deg, #3B82F6, #2563eb); }
    .gov-fill { background: linear-gradient(90deg, #8B5CF6, #7c3aed); }
    
    .report-summary-text {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-secondary);
    }
    
    .success-text {
      color: var(--accent-success);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    /* Summary scoring */
    .esg-metric-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
      padding: 24px;
    }
    .radial-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
    }
    .score-green { background: radial-gradient(circle, var(--bg-card) 60%, transparent 62%), conic-gradient(var(--accent-success) 0% 82%, rgba(255,255,255,0.05) 82% 100%); }
    .score-blue { background: radial-gradient(circle, var(--bg-card) 60%, transparent 62%), conic-gradient(var(--accent-info) 0% 76%, rgba(255,255,255,0.05) 76% 100%); }
    .score-purple { background: radial-gradient(circle, var(--bg-card) 60%, transparent 62%), conic-gradient(var(--accent-warning) 0% 91%, rgba(255,255,255,0.05) 91% 100%); }
    
    .weight-lbl {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
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

    /* Builder Form */
    .form-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .action-form {
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
      border-color: var(--text-primary);
    }
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 4px;
    }
    .checkbox-lbl {
      font-size: 13px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
  `;
}
