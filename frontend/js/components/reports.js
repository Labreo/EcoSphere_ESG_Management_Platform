import * as api from '../api/reports.js';
import { renderLoading } from '../api/toast.js';

let state = {
  filters: {
    department: 'All Departments',
    dateRange: 'All Dates',
    module: 'All Modules',
    employee: 'All Employees',
    challenge: 'All Challenges',
    category: 'All Categories'
  },
  builderFields: {
    co2e: true,
    xp: true,
    compliance: true
  },
  searchQuery: '',
  records: []
};

/**
 * Filter calculation helpers
 */
function getFilteredRecords() {
  return state.records.filter(r => {
    // 1. Department Filter
    if (state.filters.department !== 'All Departments' && r.department !== state.filters.department) {
      return false;
    }
    // 2. Date Range Filter
    if (state.filters.dateRange !== 'All Dates') {
      const year = r.date.split('-')[0];
      const month = parseInt(r.date.split('-')[1], 10);
      if (state.filters.dateRange === 'Q3 2026 (Current)') {
        if (!(year === '2026' && month >= 7 && month <= 9)) return false;
      } else if (state.filters.dateRange === 'Q2 2026') {
        if (!(year === '2026' && month >= 4 && month <= 6)) return false;
      } else if (state.filters.dateRange === 'Full Year 2025') {
        if (year !== '2025') return false;
      } else if (state.filters.dateRange === 'Last 30 Days') {
        if (r.date < '2026-06-12') return false;
      } else if (state.filters.dateRange === 'Last Quarter') {
        if (!(year === '2026' && month >= 4 && month <= 6)) return false;
      } else if (state.filters.dateRange === 'Year to Date') {
        if (year !== '2026') return false;
      }
    }
    // 3. Module Filter
    if (state.filters.module !== 'All Modules' && r.module !== state.filters.module) {
      return false;
    }
    // 4. Employee Filter
    if (state.filters.employee !== 'All Employees' && r.employee !== state.filters.employee) {
      return false;
    }
    // 5. Challenge Filter
    if (state.filters.challenge !== 'All Challenges' && r.challenge !== state.filters.challenge) {
      return false;
    }
    // 6. ESG Category Filter
    if (state.filters.category !== 'All Categories' && r.category !== state.filters.category) {
      return false;
    }
    // 7. Search Text query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const match = r.indicator.toLowerCase().includes(q) ||
                    r.details.toLowerCase().includes(q) ||
                    r.department.toLowerCase().includes(q) ||
                    r.employee.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

function getEnvironmentalMetrics(filtered) {
  const envRecs = filtered.filter(r => r.module === 'Environmental');
  let totalEmissions = 0;
  let totalOffsets = 0;
  envRecs.forEach(r => {
    if (r.co2e > 0) totalEmissions += r.co2e;
    else totalOffsets += Math.abs(r.co2e);
  });
  
  const netEmissions = totalEmissions - totalOffsets;
  const targetReduction = 5.0;
  const goalCompletion = Math.min(100, Math.round((totalOffsets / targetReduction) * 100));

  const dept = state.filters.department;
  const allGoals = [
    { name: 'Reduce Fleet Emissions', department: 'Logistics & Supply Chain', target: 5.0, current: totalOffsets, status: 'Active' },
    { name: 'Cut Office Waste', department: 'Product Design & R&D', target: 1.0, current: 0.8, status: 'On Track' },
    { name: 'Office Solar Energy', department: 'Finance & Operations', target: 3.0, current: 2.34, status: 'Completed' }
  ];
  
  const filteredGoals = allGoals.filter(g => dept === 'All Departments' || g.department === dept);

  return {
    netEmissions: netEmissions.toFixed(2),
    totalEmissions: totalEmissions.toFixed(2),
    totalOffsets: totalOffsets.toFixed(2),
    goalCompletion: Math.max(0, goalCompletion),
    goals: filteredGoals
  };
}

function getSocialMetrics(filtered) {
  const socRecs = filtered.filter(r => r.module === 'Social');
  const totalXP = socRecs.reduce((sum, r) => sum + r.xp, 0);
  
  const trainingCompletions = filtered.filter(r => r.indicator.includes('Training') || r.indicator.includes('Fundamentals') || r.indicator.includes('Workshop'));
  const completionRate = trainingCompletions.length > 0 ? Math.min(100, Math.round((trainingCompletions.length / 3) * 100)) : 78;

  return {
    totalXP,
    completionRate,
    participationCount: socRecs.length
  };
}

function getGovernanceMetrics(filtered) {
  const govRecs = filtered.filter(r => r.module === 'Governance');
  const signaturesCount = govRecs.filter(r => r.indicator.includes('Signature') || r.indicator.includes('Acknowledgement')).length;
  
  const compliantCount = filtered.filter(r => r.compliance === 'Compliant').length;
  const underReviewCount = filtered.filter(r => r.compliance === 'Under Review').length;
  const nonCompliantCount = filtered.filter(r => r.compliance === 'Non-Compliant').length;
  
  const totalAudited = filtered.length;
  const complianceRate = totalAudited > 0 ? Math.round((compliantCount / totalAudited) * 100) : 91;

  return {
    signaturesCount,
    complianceRate,
    compliantCount,
    underReviewCount,
    nonCompliantCount
  };
}

function getESGSummaryMetrics(filtered) {
  const envMetrics = getEnvironmentalMetrics(filtered);
  const socMetrics = getSocialMetrics(filtered);
  const govMetrics = getGovernanceMetrics(filtered);
  
  // Derive score mappings (50 to 100 range)
  const envScore = Math.max(50, Math.min(100, 80 + Math.round((envMetrics.goalCompletion - 50) / 2.5)));
  const socScore = Math.max(50, Math.min(100, 70 + Math.round((socMetrics.completionRate - 50) / 2)));
  const govScore = Math.max(50, Math.min(100, govMetrics.complianceRate));
  
  const weightedTotal = (envScore * 0.40 + socScore * 0.30 + govScore * 0.30).toFixed(1);
  
  return {
    envScore,
    socScore,
    govScore,
    weightedTotal
  };
}

/**
 * Main View Page Render
 */
function mapDepartmentName(name) {
  const mapping = {
    'Corporate': 'Finance & Operations',
    'Manufacturing': 'Product Design & R&D',
    'Logistics': 'Logistics & Supply Chain',
    'Research & Development': 'Product Design & R&D',
    'Sales': 'Finance & Operations'
  };
  return mapping[name] || name;
}

function mapToUnifiedRecords(envData, socData, govData) {
  const unified = [];

  if (envData && envData.transactions) {
    envData.transactions.forEach(tx => {
      unified.push({
        module: 'Environmental',
        date: tx.transaction_date.split('T')[0],
        department: mapDepartmentName(tx.department_name),
        category: tx.source_type,
        indicator: tx.activity_type,
        value: `${(tx.calculated_emissions_kg / 1000).toFixed(2)} tCO2e`,
        details: `Qty: ${tx.raw_value} (${tx.source_id})`,
        co2e: tx.calculated_emissions_kg / 1000,
        xp: 0,
        compliance: 'Compliant'
      });
    });
  }

  if (socData && socData.activities) {
    socData.activities.forEach(act => {
      if (act.participants && act.participants.length > 0) {
        act.participants.forEach(p => {
          unified.push({
            module: 'Social',
            date: p.completion_date ? p.completion_date.split('T')[0] : act.date.split('T')[0],
            department: p.employee_name === 'Admin User' ? 'Finance & Operations' : 
                        p.employee_name === 'Aditi Rao' ? 'Research & Development' : 
                        p.employee_name === 'Karan Shah' ? 'Finance & Operations' : 
                        p.employee_name === 'Sarah Jenkins' ? 'Research & Development' : 'Finance & Operations',
            category: 'CSR Activity',
            indicator: act.title,
            value: `${p.points_earned} Points`,
            details: `${p.employee_name} (${p.approval_status})`,
            co2e: 0,
            xp: p.points_earned,
            compliance: 'Compliant'
          });
        });
      } else {
        unified.push({
          module: 'Social',
          date: act.date.split('T')[0],
          department: 'Finance & Operations',
          category: 'CSR Activity',
          indicator: act.title,
          value: 'Pending',
          details: 'No participants',
          co2e: 0,
          xp: 0,
          compliance: 'Compliant'
        });
      }
    });
  }

  if (govData) {
    if (govData.issues) {
      govData.issues.forEach(issue => {
        unified.push({
          module: 'Governance',
          date: issue.due_date,
          department: 'Product Design & R&D',
          category: 'Compliance Issue',
          indicator: issue.title,
          value: issue.severity,
          details: `Status: ${issue.status}`,
          co2e: 0,
          xp: 0,
          compliance: issue.status === 'Resolved' ? 'Compliant' : 'Non-Compliant'
        });
      });
    }
    if (govData.audits) {
      govData.audits.forEach(audit => {
        unified.push({
          module: 'Governance',
          date: audit.audit_date,
          department: 'Logistics & Supply Chain',
          category: 'Audit',
          indicator: audit.title,
          value: `${audit.score}/100`,
          details: `Auditor: ${audit.auditor} (${audit.status})`,
          co2e: 0,
          xp: 0,
          compliance: audit.score >= 80 ? 'Compliant' : 'Under Review'
        });
      });
    }
  }

  return unified;
}

function getMockReportRecords() {
  const records = [];
  const depts = ['Product Design & R&D', 'Finance & Operations', 'Logistics & Supply Chain'];
  const sources = ['Grid Electricity', 'Fleet Diesel', 'Natural Gas', 'Business Travel'];
  const activities = ['Tree Plantation Drive', 'Blood Donation Camp', 'Beach Cleanup', 'ESG Workshop'];
  const employees = ['Aditi Rao', 'Karan Shah', 'Sarah Jenkins', 'Mark Robinson', 'Admin User'];
  const today = new Date();
  for (let i = 0; i < 25; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - Math.floor(Math.random() * 90));
    const dateStr = d.toISOString().split('T')[0];
    if (i < 10) {
      const src = sources[i % sources.length];
      records.push({
        module: 'Environmental', date: dateStr, department: depts[i % depts.length],
        category: src, indicator: src + ' Consumption',
        value: (Math.random() * 20 + 1).toFixed(2) + ' tCO2e',
        details: `Qty: ${Math.round(Math.random() * 50000 + 1000)} units`,
        co2e: Math.random() * 20 + 1, xp: 0, compliance: 'Compliant'
      });
    } else if (i < 18) {
      const act = activities[(i - 10) % activities.length];
      const emp = employees[(i - 10) % employees.length];
      records.push({
        module: 'Social', date: dateStr, department: depts[(i - 10) % depts.length],
        category: 'CSR Activity', indicator: act,
        value: Math.floor(Math.random() * 50 + 10) + ' Points',
        details: `${emp} (Approved)`,
        co2e: 0, xp: Math.floor(Math.random() * 50 + 10), compliance: 'Compliant'
      });
    } else {
      records.push({
        module: 'Governance', date: dateStr, department: depts[(i - 18) % depts.length],
        category: i % 2 === 0 ? 'Compliance Issue' : 'Audit',
        indicator: i % 2 === 0 ? 'Missing documentation' : 'Q3 Safety Review',
        value: i % 2 === 0 ? 'High' : '85/100',
        details: i % 2 === 0 ? 'Status: Open' : 'Auditor: Internal Team (Completed)',
        co2e: 0, xp: 0, compliance: i % 2 === 0 ? 'Non-Compliant' : 'Compliant'
      });
    }
  }
  return records;
}

export async function renderReportsPage(container, pageKey) {
  if (!pageKey) pageKey = 'environmental-report';
  
  renderLoading(container);
  
  try {
    const filters = {};
    const [envData, socData, govData] = await Promise.all([
      api.getEnvironmentalReport(filters).catch(() => null),
      api.getSocialReport(filters).catch(() => null),
      api.getGovernanceReport(filters).catch(() => null)
    ]);
    if (envData && socData && govData) {
      state.records = mapToUnifiedRecords(envData, socData, govData);
    } else {
      state.records = getMockReportRecords();
    }
  } catch (err) {
    state.records = getMockReportRecords();
  }
  
  const filtered = getFilteredRecords();
  let contentHtml = '';
  
  if (pageKey === 'environmental-report') {
    contentHtml = renderEnvironmentalReport(filtered);
  } else if (pageKey === 'social-report') {
    contentHtml = renderSocialReport(filtered);
  } else if (pageKey === 'governance-report') {
    contentHtml = renderGovernanceReport(filtered);
  } else if (pageKey === 'esg-summary') {
    contentHtml = renderESGSummaryReport(filtered);
  } else if (pageKey === 'custom-report-builder') {
    contentHtml = renderCustomReportBuilderView(filtered);
  }

  const reportsPageTitles = { 'environmental-report': 'Environmental Report', 'social-report': 'Social Report', 'governance-report': 'Governance Report', 'esg-summary': 'ESG Summary', 'custom-report-builder': 'Custom Builder' };

  const subNavHtml = `
      <div class="sub-nav-tabs reports">
        <a href="#reports/environmental-report" class="sub-nav-tab ${pageKey === 'environmental-report' ? 'active' : ''}">
        <i data-lucide="leaf"></i> Environmental
      </a>
      <a href="#reports/social-report" class="sub-nav-tab ${pageKey === 'social-report' ? 'active' : ''}">
        <i data-lucide="users"></i> Social
      </a>
      <a href="#reports/governance-report" class="sub-nav-tab ${pageKey === 'governance-report' ? 'active' : ''}">
        <i data-lucide="shield"></i> Governance
      </a>
      <a href="#reports/esg-summary" class="sub-nav-tab ${pageKey === 'esg-summary' ? 'active' : ''}">
        <i data-lucide="pie-chart"></i> ESG Summary
      </a>
      <a href="#reports/custom-report-builder" class="sub-nav-tab ${pageKey === 'custom-report-builder' ? 'active' : ''}">
        <i data-lucide="wand-2"></i> Custom Builder
      </a>
    </div>
  `;

  container.innerHTML = `
    <div class="view-container">
      <div class="breadcrumb">
        <a href="#dashboard">Dashboard</a>
        <span class="breadcrumb-sep">›</span>
        <a href="#reports/environmental-report">Reports</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">${reportsPageTitles[pageKey] || 'Reports'}</span>
      </div>

      <div class="view-header">
        <h1 class="view-title">${getReportsTitle(pageKey)}</h1>
        <p class="view-description">${getReportsDesc(pageKey)}</p>
      </div>
      
      ${subNavHtml}
      
      ${renderFiltersRow()}
      
      <div id="reports-active-content">
        ${contentHtml}
      </div>
    </div>
    <style>${getReportsCSS()}</style>
  `;

  // Bind actions
  bindReportsEvents(container, pageKey);

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
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

/**
 * Filter Component Renders
 */
function renderFiltersRow() {
  return `
    <div class="glass-card filter-card-container">
      <div class="filter-header-bar">
        <div class="filter-title-grp">
          <i data-lucide="sliders-horizontal"></i>
          <h4>Report Configuration & Filters</h4>
        </div>
        <button class="btn btn-secondary btn-mini-act" id="btn-reset-filters">
          <i data-lucide="refresh-cw"></i> Reset Filters
        </button>
      </div>
      <div class="filters-grid">
        <div class="filter-col">
          <label>Department</label>
          <select id="filter-department" class="filter-input-el">
            <option ${state.filters.department === 'All Departments' ? 'selected' : ''}>All Departments</option>
            <option ${state.filters.department === 'Product Design & R&D' ? 'selected' : ''}>Product Design & R&D</option>
            <option ${state.filters.department === 'Finance & Operations' ? 'selected' : ''}>Finance & Operations</option>
            <option ${state.filters.department === 'Logistics & Supply Chain' ? 'selected' : ''}>Logistics & Supply Chain</option>
          </select>
        </div>
        <div class="filter-col">
          <label>Date Range</label>
          <select id="filter-date-range" class="filter-input-el">
            <option ${state.filters.dateRange === 'All Dates' ? 'selected' : ''}>All Dates</option>
            <option ${state.filters.dateRange === 'Q3 2026 (Current)' ? 'selected' : ''}>Q3 2026 (Current)</option>
            <option ${state.filters.dateRange === 'Q2 2026' ? 'selected' : ''}>Q2 2026</option>
            <option ${state.filters.dateRange === 'Full Year 2025' ? 'selected' : ''}>Full Year 2025</option>
            <option ${state.filters.dateRange === 'Last 30 Days' ? 'selected' : ''}>Last 30 Days</option>
            <option ${state.filters.dateRange === 'Last Quarter' ? 'selected' : ''}>Last Quarter</option>
            <option ${state.filters.dateRange === 'Year to Date' ? 'selected' : ''}>Year to Date</option>
          </select>
        </div>
        <div class="filter-col">
          <label>Module Focus</label>
          <select id="filter-module" class="filter-input-el">
            <option ${state.filters.module === 'All Modules' ? 'selected' : ''}>All Modules</option>
            <option ${state.filters.module === 'Environmental' ? 'selected' : ''}>Environmental</option>
            <option ${state.filters.module === 'Social' ? 'selected' : ''}>Social</option>
            <option ${state.filters.module === 'Governance' ? 'selected' : ''}>Governance</option>
          </select>
        </div>
        <div class="filter-col">
          <label>Employee Name</label>
          <select id="filter-employee" class="filter-input-el">
            <option ${state.filters.employee === 'All Employees' ? 'selected' : ''}>All Employees</option>
            <option ${state.filters.employee === 'Aditi Rao' ? 'selected' : ''}>Aditi Rao</option>
            <option ${state.filters.employee === 'Karan Shah' ? 'selected' : ''}>Karan Shah</option>
            <option ${state.filters.employee === 'Mark Robinson' ? 'selected' : ''}>Mark Robinson</option>
            <option ${state.filters.employee === 'Sarah Jenkins' ? 'selected' : ''}>Sarah Jenkins</option>
            <option ${state.filters.employee === 'Bob Sterling' ? 'selected' : ''}>Bob Sterling</option>
            <option ${state.filters.employee === 'Jane Doe' ? 'selected' : ''}>Jane Doe</option>
            <option ${state.filters.employee === 'Alice Vance' ? 'selected' : ''}>Alice Vance</option>
          </select>
        </div>
        <div class="filter-col">
          <label>Challenge</label>
          <select id="filter-challenge" class="filter-input-el">
            <option ${state.filters.challenge === 'All Challenges' ? 'selected' : ''}>All Challenges</option>
            <option ${state.filters.challenge === 'Sustainability Sprint' ? 'selected' : ''}>Sustainability Sprint</option>
            <option ${state.filters.challenge === 'Recycle Challenge' ? 'selected' : ''}>Recycle Challenge</option>
            <option ${state.filters.challenge === 'Commute Green Week' ? 'selected' : ''}>Commute Green Week</option>
            <option ${state.filters.challenge === 'The Paperless Office' ? 'selected' : ''}>The Paperless Office</option>
            <option ${state.filters.challenge === 'Energy Audit Champion' ? 'selected' : ''}>Energy Audit Champion</option>
          </select>
        </div>
        <div class="filter-col">
          <label>ESG Category</label>
          <select id="filter-category" class="filter-input-el">
            <option ${state.filters.category === 'All Categories' ? 'selected' : ''}>All Categories</option>
            <option ${state.filters.category === 'Office Carbon Reduction' ? 'selected' : ''}>Office Carbon Reduction</option>
            <option ${state.filters.category === 'Community Outreach' ? 'selected' : ''}>Community Outreach</option>
            <option ${state.filters.category === 'Renewable Transition' ? 'selected' : ''}>Renewable Transition</option>
            <option ${state.filters.category === 'Office Green' ? 'selected' : ''}>Office Green</option>
            <option ${state.filters.category === 'Transport' ? 'selected' : ''}>Transport</option>
            <option ${state.filters.category === 'Electricity' ? 'selected' : ''}>Electricity</option>
            <option ${state.filters.category === 'Diversity' ? 'selected' : ''}>Diversity</option>
            <option ${state.filters.category === 'Compliance' ? 'selected' : ''}>Compliance</option>
          </select>
        </div>
      </div>
    </div>
  `;
}

/**
 * Environmental Report Render
 */
function renderEnvironmentalReport(filtered) {
  const envRecs = filtered.filter(r => r.module === 'Environmental');
  const metrics = getEnvironmentalMetrics(filtered);
  
  const tableRows = envRecs.length > 0 
    ? envRecs.map(r => `
        <tr>
          <td><strong>${r.date}</strong></td>
          <td>${r.department}</td>
          <td><span class="status-tag status-tag-info">${r.category}</span></td>
          <td>${r.indicator}</td>
          <td><strong>${r.value}</strong></td>
          <td><span class="origin-badge">${r.details}</span></td>
        </tr>
      `).join('')
    : `<tr><td colspan="6" class="no-records-msg">No environmental records match the selected filters.</td></tr>`;

  return `
    <div class="table-actions">
      <h3 class="section-subtitle">Environmental Performance Metrics</h3>
      <div class="btn-group">
        <button class="btn btn-report" id="btn-export-pdf"><i data-lucide="download"></i> Export PDF</button>
        <button class="btn btn-secondary" id="btn-export-excel"><i data-lucide="sheet"></i> Excel</button>
        <button class="btn btn-secondary" id="btn-export-csv"><i data-lucide="file-text"></i> CSV</button>
      </div>
    </div>

    <div class="grid-3">
      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>Carbon Footprint (Net)</span>
          <i data-lucide="leaf"></i>
        </div>
        <h3>${metrics.netEmissions} <span class="unit-lbl">tCO2e</span></h3>
        <p class="text-secondary">Emissions: ${metrics.totalEmissions} | Offsets: ${metrics.totalOffsets}</p>
      </div>
      
      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>Completion vs Goals</span>
          <i data-lucide="target"></i>
        </div>
        <h3>${metrics.goalCompletion}%</h3>
        <div class="progress-track" style="height: 6px; margin: 8px 0;">
          <div class="progress-fill env-fill" style="width: ${metrics.goalCompletion}%;"></div>
        </div>
        <p class="text-secondary">${metrics.goals.length} target goals tracked</p>
      </div>

      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>Data Audit State</span>
          <i data-lucide="shield-check"></i>
        </div>
        <h3 class="success-text"><i data-lucide="check-circle-2"></i> Verified</h3>
        <p class="text-secondary">Audit conducted by SGS Group on 2026-06-15.</p>
      </div>
    </div>

    <div class="view-card">
      <div class="card-header">
        <h3>Report Summary Details: Carbon Log Register</h3>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Department</th>
              <th>Category</th>
              <th>Indicator Name</th>
              <th>Value</th>
              <th>Source Details</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Social Report Render
 */
function renderSocialReport(filtered) {
  const socRecs = filtered.filter(r => r.module === 'Social');
  const metrics = getSocialMetrics(filtered);
  
  const tableRows = socRecs.length > 0 
    ? socRecs.map(r => `
        <tr>
          <td><strong>${r.date}</strong></td>
          <td>${r.department}</td>
          <td><span class="status-tag status-tag-active">${r.category}</span></td>
          <td>${r.indicator}</td>
          <td><strong>${r.value}</strong></td>
          <td><span class="origin-badge">${r.details}</span></td>
        </tr>
      `).join('')
    : `<tr><td colspan="6" class="no-records-msg">No social records match the selected filters.</td></tr>`;

  return `
    <div class="table-actions">
      <h3 class="section-subtitle">Social Performance Metrics</h3>
      <div class="btn-group">
        <button class="btn btn-report" id="btn-export-pdf"><i data-lucide="download"></i> Export PDF</button>
        <button class="btn btn-secondary" id="btn-export-excel"><i data-lucide="sheet"></i> Excel</button>
        <button class="btn btn-secondary" id="btn-export-csv"><i data-lucide="file-text"></i> CSV</button>
      </div>
    </div>

    <div class="grid-3">
      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>Employee Social Capital</span>
          <i data-lucide="users"></i>
        </div>
        <h3>${metrics.totalXP} <span class="unit-lbl">XP Earned</span></h3>
        <p class="text-secondary">Earned from CSR & sustainability sprint actions.</p>
      </div>
      
      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>Required Training Progress</span>
          <i data-lucide="book-open"></i>
        </div>
        <h3>${metrics.completionRate}%</h3>
        <div class="progress-track" style="height: 6px; margin: 8px 0;">
          <div class="progress-fill soc-fill" style="width: ${metrics.completionRate}%;"></div>
        </div>
        <p class="text-secondary">Average completion of mandatory modules</p>
      </div>

      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>CSR Participation Rate</span>
          <i data-lucide="heart"></i>
        </div>
        <h3>${metrics.participationCount} <span class="unit-lbl">Activities Logged</span></h3>
        <p class="text-secondary">Unique local and remote environmental outreach events.</p>
      </div>
    </div>

    <div class="view-card">
      <div class="card-header">
        <h3>Social Responsibility & Employee Participation Log</h3>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Department</th>
              <th>Category</th>
              <th>Activity Description</th>
              <th>Metrics Value</th>
              <th>Log Details</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Governance Report Render
 */
function renderGovernanceReport(filtered) {
  const govRecs = filtered.filter(r => r.module === 'Governance');
  const metrics = getGovernanceMetrics(filtered);
  
  const tableRows = govRecs.length > 0 
    ? govRecs.map(r => `
        <tr>
          <td><strong>${r.date}</strong></td>
          <td>${r.department}</td>
          <td><span class="status-tag status-tag-warning">${r.category}</span></td>
          <td>${r.indicator}</td>
          <td>
            <span class="compliance-tag ${
              r.compliance === 'Compliant' ? 'compliant' : 
              r.compliance === 'Under Review' ? 'under-review' : 
              r.compliance === 'Pending' ? 'pending' : 'non-compliant'
            }">${r.compliance}</span>
          </td>
          <td><span class="origin-badge">${r.details}</span></td>
        </tr>
      `).join('')
    : `<tr><td colspan="6" class="no-records-msg">No governance records match the selected filters.</td></tr>`;

  return `
    <div class="table-actions">
      <h3 class="section-subtitle">Governance & Compliance Metrics</h3>
      <div class="btn-group">
        <button class="btn btn-report" id="btn-export-pdf"><i data-lucide="download"></i> Export PDF</button>
        <button class="btn btn-secondary" id="btn-export-excel"><i data-lucide="sheet"></i> Excel</button>
        <button class="btn btn-secondary" id="btn-export-csv"><i data-lucide="file-text"></i> CSV</button>
      </div>
    </div>

    <div class="grid-3">
      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>Overall Compliance Index</span>
          <i data-lucide="shield-alert"></i>
        </div>
        <h3>${metrics.complianceRate}%</h3>
        <div class="progress-track" style="height: 6px; margin: 8px 0;">
          <div class="progress-fill gov-fill" style="width: ${metrics.complianceRate}%;"></div>
        </div>
        <p class="text-secondary">Compliance score across active records</p>
      </div>
      
      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>Policy Acknowledgements</span>
          <i data-lucide="pen-tool"></i>
        </div>
        <h3>${metrics.signaturesCount} <span class="unit-lbl">Employee Signatures</span></h3>
        <p class="text-secondary">Ethics, Supplier, and Commute policy codes.</p>
      </div>

      <div class="glass-card module-report-card">
        <div class="m-card-hdr">
          <span>Compliance Violations & Audits</span>
          <i data-lucide="alert-triangle"></i>
        </div>
        <h3 class="${metrics.nonCompliantCount > 0 ? 'danger-text' : 'success-text'}">
          ${metrics.nonCompliantCount} <span class="unit-lbl">Overdue Issues</span>
        </h3>
        <p class="text-secondary">${metrics.underReviewCount} records currently under audit review</p>
      </div>
    </div>

    <div class="view-card">
      <div class="card-header">
        <h3>Policy Compliance & ESG Auditing Log</h3>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Department</th>
              <th>Category</th>
              <th>Policy / Audit Scope</th>
              <th>Compliance State</th>
              <th>Audit Log Details</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * ESG Summary Report Render
 */
function renderESGSummaryReport(filtered) {
  const metrics = getESGSummaryMetrics(filtered);
  
  const envConic = `background: radial-gradient(circle, var(--bg-card) 60%, transparent 62%), conic-gradient(var(--accent-success) 0% ${metrics.envScore}%, rgba(255,255,255,0.05) ${metrics.envScore}% 100%)`;
  const socConic = `background: radial-gradient(circle, var(--bg-card) 60%, transparent 62%), conic-gradient(var(--accent-info) 0% ${metrics.socScore}%, rgba(255,255,255,0.05) ${metrics.socScore}% 100%)`;
  const govConic = `background: radial-gradient(circle, var(--bg-card) 60%, transparent 62%), conic-gradient(var(--accent-warning) 0% ${metrics.govScore}%, rgba(255,255,255,0.05) ${metrics.govScore}% 100%)`;

  // Dynamic calculations per department
  const rdFiltered = state.records.filter(r => r.department === 'Product Design & R&D');
  const rdM = getESGSummaryMetrics(rdFiltered);
  const finFiltered = state.records.filter(r => r.department === 'Finance & Operations');
  const finM = getESGSummaryMetrics(finFiltered);
  const lscFiltered = state.records.filter(r => r.department === 'Logistics & Supply Chain');
  const lscM = getESGSummaryMetrics(lscFiltered);

  return `
    <div class="table-actions">
      <h3 class="section-subtitle">Executive Overview: All 4 Scores</h3>
      <button class="btn btn-report" id="btn-export-pdf"><i data-lucide="download"></i> Export ESG Package</button>
    </div>

    <div class="grid-3">
      <div class="glass-card esg-metric-score">
        <h4>Environmental Score</h4>
        <div class="radial-circle" style="${envConic}">${metrics.envScore}</div>
        <span class="weight-lbl">Weight: 40%</span>
      </div>
      <div class="glass-card esg-metric-score">
        <h4>Social Score</h4>
        <div class="radial-circle" style="${socConic}">${metrics.socScore}</div>
        <span class="weight-lbl">Weight: 30%</span>
      </div>
      <div class="glass-card esg-metric-score">
        <h4>Governance Score</h4>
        <div class="radial-circle" style="${govConic}">${metrics.govScore}</div>
        <span class="weight-lbl">Weight: 30%</span>
      </div>
    </div>

    <div class="view-card esg-summary-weighted-card">
      <div class="card-header flex-header">
        <div>
          <h3>Departmental Weight Contribution Matrix</h3>
          <p class="text-secondary">Shows individual department breakdowns and final integrated ESG rating</p>
        </div>
        <div class="overall-esg-rating-pill">
          <span>Overall Integrated Score:</span>
          <strong>${metrics.weightedTotal}</strong>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Env Score (40%)</th>
              <th>Soc Score (30%)</th>
              <th>Gov Score (30%)</th>
              <th>Weighted Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Product Design & R&D</strong></td>
              <td>${rdM.envScore}</td>
              <td>${rdM.socScore}</td>
              <td>${rdM.govScore}</td>
              <td><strong class="success-text">${rdM.weightedTotal}</strong></td>
            </tr>
            <tr>
              <td><strong>Finance & Operations</strong></td>
              <td>${finM.envScore}</td>
              <td>${finM.socScore}</td>
              <td>${finM.govScore}</td>
              <td><strong class="info-text">${finM.weightedTotal}</strong></td>
            </tr>
            <tr>
              <td><strong>Logistics & Supply Chain</strong></td>
              <td>${lscM.envScore}</td>
              <td>${lscM.socScore}</td>
              <td>${lscM.govScore}</td>
              <td><strong class="warning-text">${lscM.weightedTotal}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Custom Report Builder view
 */
function renderCustomReportBuilderView(filtered) {
  const showCO2 = state.builderFields.co2e;
  const showXP = state.builderFields.xp;
  const showCompliance = state.builderFields.compliance;

  const tableRows = filtered.length > 0
    ? filtered.map(r => {
        let cellsHtml = `
          <td><strong>${r.date}</strong></td>
          <td>${r.department}</td>
          <td>${r.module}</td>
          <td>${r.indicator}</td>
        `;
        if (showCO2) cellsHtml += `<td>${r.co2e !== 0 ? r.co2e + ' tCO2e' : '—'}</td>`;
        if (showXP) cellsHtml += `<td>${r.xp !== 0 ? r.xp + ' XP' : '—'}</td>`;
        if (showCompliance) cellsHtml += `<td><span class="compliance-tag ${r.compliance === 'Compliant' ? 'compliant' : r.compliance === 'Pending' ? 'pending' : 'non-compliant'}">${r.compliance}</span></td>`;
        return `<tr>${cellsHtml}</tr>`;
      }).join('')
    : `<tr><td colspan="7" class="no-records-msg">No custom records match the builder parameters. Click 'Run Report' after updating filters.</td></tr>`;

  let headersHtml = `
    <th>Timestamp</th>
    <th>Dept</th>
    <th>Module</th>
    <th>Indicator Name</th>
  `;
  if (showCO2) headersHtml += `<th>Calc CO2e</th>`;
  if (showXP) headersHtml += `<th>XP Awarded</th>`;
  if (showCompliance) headersHtml += `<th>Compliance</th>`;

  return `
    <div class="grid-3 custom-builder-view-layout">
      <!-- Builder Panel (Left 1 col) -->
      <div class="glass-card builder-form-wrapper" style="grid-column: span 1;">
        <h3 class="form-title"><i data-lucide="settings"></i> Builder Options</h3>
        <div class="action-form">
          <div class="form-group">
            <label>Include Extra Data Columns</label>
            <div class="checkbox-group">
              <label class="checkbox-lbl">
                <input type="checkbox" id="chk-builder-co2e" ${showCO2 ? 'checked' : ''} />
                Calculated CO2e Footprint
              </label>
              <label class="checkbox-lbl">
                <input type="checkbox" id="chk-builder-xp" ${showXP ? 'checked' : ''} />
                Employee XP Scores
              </label>
              <label class="checkbox-lbl">
                <input type="checkbox" id="chk-builder-compliance" ${showCompliance ? 'checked' : ''} />
                Compliance Incidents
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>Text Content Query</label>
            <input type="text" id="builder-search-input" value="${state.searchQuery}" placeholder="Search indicator or detail..." class="form-input" />
          </div>

          <button type="button" class="btn btn-report full-width" id="btn-run-custom-report">
            <i data-lucide="play"></i> Run Report
          </button>
        </div>
      </div>

      <!-- Preview Registry (Right 2 cols) -->
      <div class="view-card" style="grid-column: span 2; margin-top: 0;">
        <div class="card-header flex-header">
          <div>
            <h3>Custom Compiled Preview</h3>
            <p class="text-secondary">${filtered.length} matching rows found in aggregate logs</p>
          </div>
          <div class="btn-group">
            <button class="btn btn-secondary btn-mini-act" id="btn-export-pdf"><i data-lucide="download"></i> PDF</button>
            <button class="btn btn-secondary btn-mini-act" id="btn-export-excel"><i data-lucide="sheet"></i> Excel</button>
            <button class="btn btn-secondary btn-mini-act" id="btn-export-csv"><i data-lucide="file-text"></i> CSV</button>
          </div>
        </div>
        <div class="table-wrapper">
          <table class="data-table" id="custom-compiled-table-preview">
            <thead>
              <tr>
                ${headersHtml}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * Event Bindings
 */
function bindReportsEvents(container, pageKey) {
  const deptSelect = container.querySelector('#filter-department');
  const dateSelect = container.querySelector('#filter-date-range');
  const moduleSelect = container.querySelector('#filter-module');
  const empSelect = container.querySelector('#filter-employee');
  const chalSelect = container.querySelector('#filter-challenge');
  const catSelect = container.querySelector('#filter-category');

  const onFilterChange = () => {
    state.filters.department = deptSelect.value;
    state.filters.dateRange = dateSelect.value;
    state.filters.module = moduleSelect.value;
    state.filters.employee = empSelect.value;
    state.filters.challenge = chalSelect.value;
    state.filters.category = catSelect.value;
    
    renderReportsPage(container, pageKey);
  };

  if (deptSelect) deptSelect.addEventListener('change', onFilterChange);
  if (dateSelect) dateSelect.addEventListener('change', onFilterChange);
  if (moduleSelect) moduleSelect.addEventListener('change', onFilterChange);
  if (empSelect) empSelect.addEventListener('change', onFilterChange);
  if (chalSelect) chalSelect.addEventListener('change', onFilterChange);
  if (catSelect) catSelect.addEventListener('change', onFilterChange);

  // Reset Filters button
  const resetBtn = container.querySelector('#btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.filters = {
        department: 'All Departments',
        dateRange: 'All Dates',
        module: 'All Modules',
        employee: 'All Employees',
        challenge: 'All Challenges',
        category: 'All Categories'
      };
      state.searchQuery = '';
      renderReportsPage(container, pageKey);
      showToast('Filters reset to default configurations.');
    });
  }

  // Custom Report Builder compile elements
  const chkCO2 = container.querySelector('#chk-builder-co2e');
  const chkXP = container.querySelector('#chk-builder-xp');
  const chkComp = container.querySelector('#chk-builder-compliance');
  const searchInput = container.querySelector('#builder-search-input');
  const runBtn = container.querySelector('#btn-run-custom-report');

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      if (chkCO2) state.builderFields.co2e = chkCO2.checked;
      if (chkXP) state.builderFields.xp = chkXP.checked;
      if (chkComp) state.builderFields.compliance = chkComp.checked;
      if (searchInput) state.searchQuery = searchInput.value;
      
      renderReportsPage(container, pageKey);
      showToast('Custom report compilation finished.');
    });
  }

  // Export Events binding
  const csvBtns = container.querySelectorAll('#btn-export-csv');
  const excelBtns = container.querySelectorAll('#btn-export-excel');
  const pdfBtns = container.querySelectorAll('#btn-export-pdf');

  csvBtns.forEach(btn => btn.addEventListener('click', () => exportReportData(pageKey, 'csv')));
  excelBtns.forEach(btn => btn.addEventListener('click', () => exportReportData(pageKey, 'excel')));
  pdfBtns.forEach(btn => btn.addEventListener('click', () => exportReportData(pageKey, 'pdf')));
}

/**
 * File Generation & Export Utility
 */
async function exportReportData(pageKey, format) {
  if (format === 'pdf') {
    showToast('Preparing PDF layouts for print...');
    setTimeout(() => {
      window.print();
    }, 500);
    return;
  }
  
  try {
    const filters = {};
    await api.exportReport(format, filters);
    showToast('Report exported successfully', 'success');
  } catch (err) {
    showToast('Export failed: ' + err.message, 'error');
  }
}

function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType + ';charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Toast notification overlay
 */
function showToast(message) {
  const container = document.body;
  const existing = document.querySelector('.reports-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'reports-toast';
  toast.innerHTML = `<i data-lucide="check-circle"></i> <span>${message}</span>`;
  container.appendChild(toast);
  
  if (window.lucide) {
    window.lucide.createIcons();
  }

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Reports Modular CSS Styling Rules
 */
function getReportsCSS() {
  return `
    /* Filter Card System */
    .filter-card-container {
      margin-bottom: 24px;
      padding: 16px 20px;
    }
    .filter-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 10px;
    }
    .filter-title-grp {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 14px;
    }
    .filter-title-grp i {
      width: 16px;
      height: 16px;
    }
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
    }
    .filter-col {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .filter-col label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .filter-input-el {
      background-color: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 8px 10px;
      color: var(--text-primary);
      font-size: 13px;
      outline: none;
      transition: border-color var(--transition-fast);
      width: 100%;
    }
    .filter-input-el:focus {
      border-color: var(--text-secondary);
    }

    /* Action Headers */
    .table-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
      padding-top: 8px;
    }
    .section-subtitle {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .btn-group {
      display: flex;
      gap: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: background-color var(--transition-fast), transform var(--transition-fast);
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
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .btn-mini-act {
      padding: 6px 12px;
      font-size: 12px;
      border-radius: var(--radius-sm);
    }
    .full-width {
      width: 100%;
      justify-content: center;
    }

    /* KPI Grid Cards */
    .module-report-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px;
    }
    .m-card-hdr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .m-card-hdr i {
      width: 16px;
      height: 16px;
    }
    .module-report-card h3 {
      font-family: var(--font-heading);
      font-size: 26px;
      font-weight: 700;
    }
    .unit-lbl {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-left: 4px;
    }
    .progress-track {
      height: 8px;
      width: 100%;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: var(--radius-full);
    }
    .env-fill { background: linear-gradient(90deg, var(--accent-success), #059669); }
    .soc-fill { background: linear-gradient(90deg, var(--accent-info), #2563eb); }
    .gov-fill { background: linear-gradient(90deg, var(--accent-warning), #7c3aed); }
    
    .success-text { color: var(--accent-success) !important; display: inline-flex; align-items: center; gap: 8px; }
    .info-text { color: var(--accent-info) !important; }
    .warning-text { color: var(--accent-warning) !important; }
    .danger-text { color: var(--accent-danger) !important; }
    
    /* Table designs */
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th, .data-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      font-size: 13.5px;
      text-align: left;
    }
    .data-table th {
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background-color: rgba(0, 0, 0, 0.1);
    }
    .no-records-msg {
      text-align: center;
      padding: 30px;
      color: var(--text-muted);
      font-style: italic;
    }
    .origin-badge {
      font-size: 11px;
      background-color: rgba(255, 255, 255, 0.03);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    /* Executive Radial Dials */
    .esg-metric-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
      padding: 24px;
    }
    .esg-metric-score h4 {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .radial-circle {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      font-size: 26px;
      font-weight: 800;
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
      transition: transform var(--transition-normal);
    }
    .radial-circle:hover {
      transform: scale(1.05);
    }
    .weight-lbl {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
    }

    .flex-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .overall-esg-rating-pill {
      background-color: rgba(16, 185, 129, 0.08);
      border: 1px solid var(--accent-success);
      padding: 10px 18px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13.5px;
    }
    .overall-esg-rating-pill span {
      color: var(--text-secondary);
    }
    .overall-esg-rating-pill strong {
      color: var(--accent-success);
      font-size: 18px;
      font-family: var(--font-heading);
      font-weight: 700;
    }

    /* Custom Report Builder Panel */
    .builder-form-wrapper {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-title {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .action-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-group label {
      font-size: 11px;
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: uppercase;
    }
    .form-input {
      background-color: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      color: var(--text-primary);
      font-size: 13px;
      width: 100%;
      outline: none;
      transition: border-color var(--transition-fast);
    }
    .form-input:focus {
      border-color: var(--text-secondary);
    }
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 6px 0;
    }
    .checkbox-lbl {
      font-size: 13px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      transition: color var(--transition-fast);
    }
    .checkbox-lbl:hover {
      color: var(--text-primary);
    }
    .checkbox-lbl input[type="checkbox"] {
      width: 15px;
      height: 15px;
      accent-color: var(--accent-primary);
      cursor: pointer;
    }

    /* Status Tags & Tags */
    .status-tag {
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-tag-info {
      background-color: rgba(59, 130, 246, 0.08);
      color: var(--accent-info);
      border: 1px solid rgba(59, 130, 246, 0.15);
    }
    .status-tag-active {
      background-color: rgba(16, 185, 129, 0.08);
      color: var(--accent-success);
      border: 1px solid rgba(16, 185, 129, 0.15);
    }
    .status-tag-warning {
      background-color: rgba(139, 92, 246, 0.08);
      color: var(--accent-warning);
      border: 1px solid rgba(139, 92, 246, 0.15);
    }
    
    .compliance-tag {
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: 11.5px;
      font-weight: 600;
    }
    .compliance-tag.compliant {
      background-color: rgba(16, 185, 129, 0.08);
      color: var(--accent-success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .compliance-tag.pending {
      background-color: rgba(245, 158, 11, 0.08);
      color: var(--accent-gamification);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    .compliance-tag.under-review {
      background-color: rgba(59, 130, 246, 0.08);
      color: var(--accent-info);
      border: 1px solid rgba(59, 130, 246, 0.2);
    }
    .compliance-tag.non-compliant {
      background-color: rgba(239, 68, 68, 0.08);
      color: var(--accent-danger);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    /* Interactive Toast Notifications */
    .reports-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--accent-success);
      padding: 12px 20px;
      border-radius: var(--radius-md);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 1000;
      box-shadow: var(--shadow-lg);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .reports-toast.show {
      transform: translateY(0);
      opacity: 1;
    }
    .reports-toast i {
      color: var(--accent-success);
      width: 18px;
      height: 18px;
    }

    /* Print-Only Layout Rules */
    @media print {
      body * {
        visibility: hidden;
      }
      #reports-active-content, #reports-active-content * {
        visibility: visible;
      }
      #reports-active-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white;
        color: black;
      }
      .btn-group, .table-actions button, .filter-card-container {
        display: none !important;
      }
      .glass-card {
        border: 1px solid #ccc !important;
        background: none !important;
        color: black !important;
      }
      .radial-circle {
        border: 2px solid #333 !important;
        color: black !important;
        background: none !important;
      }
    }
  `;
}
