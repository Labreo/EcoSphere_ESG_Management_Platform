import * as envApi from '../api/environmental.js';
import * as settingsApi from '../api/settings.js';
import * as reportsApi from '../api/reports.js';
import { showToast, renderLoading } from '../api/toast.js';
import { getStoredUser } from '../api/auth.js';

export async function renderDashboard(container) {
  renderLoading(container);

  const user = getStoredUser();
  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  let envScore = 82, socScore = 74, govScore = 88, overallScore = 81;
  let departments = [];
  let totals = { totalCO2: 85000, activeGoals: 3, csrParticipations: 45, challengeCompletions: 28, openIssues: 2, activeEmployees: 6 };

  try {
    const [deptData, summary] = await Promise.all([
      settingsApi.getDepartments(),
      reportsApi.getESGSummary().catch(() => null),
    ]);
    departments = deptData;

    if (summary) {
      envScore = summary.environmental_score || summary.total_environmental || envScore;
      socScore = summary.social_score || summary.total_social || socScore;
      govScore = summary.governance_score || summary.total_governance || govScore;
      overallScore = summary.total_score || summary.esg_score || overallScore;
    }

    if (deptData.length > 0) {
      const scores = deptData.map((d, i) => ({
        name: d.code || d.name.substring(0, 4).toUpperCase(),
        score: d.employee_count ? Math.min(95, 40 + (d.employee_count * 2)) : 50 + Math.floor(Math.random() * 30),
        fullName: d.name,
      }));
      departments = scores;
    }
  } catch (err) {
    showToast('Dashboard: ' + err.message, 'error');
  }

  function formatCO2(value) {
    if (value >= 1000) return (value / 1000).toFixed(1) + ' t';
    return value.toFixed(0) + ' kg';
  }

  function formatNumber(value) {
    return (value || 0).toLocaleString('en-IN');
  }

  function handleExportCSV() {
    const csvContent = [
      ['EcoSphere ESG Performance Report'],
      ['Generated On', new Date().toLocaleString()],
      [],
      ['KPI Metric', 'Value'],
      ['Environmental Score', envScore + '/100'],
      ['Social Score', socScore + '/100'],
      ['Governance Score', govScore + '/100'],
      ['Overall ESG Score', overallScore + '/100'],
      ['Total CO2 Emissions', totals.totalCO2 ? formatCO2(totals.totalCO2) : '—'],
      ['Active Goals', totals.activeGoals],
      ['CSR Participations', totals.csrParticipations],
      ['Challenges Completed', totals.challengeCompletions],
      ['Open Compliance Issues', totals.openIssues],
      ['Active Employees', totals.activeEmployees],
      [],
      ['Department Rankings'],
      ['Department', 'Score'],
      ...departments.map(d => [d.fullName || d.name, d.score + '/100']),
    ]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ecosphere_esg_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('ESG Report CSV downloaded successfully', 'success');
  }

  container.innerHTML = `
    <div class="view-container">
      <div class="breadcrumb">
        <span class="breadcrumb-current">Dashboard</span>
      </div>

      <div class="view-header">
        <div>
          <h1 class="view-title">${greeting}, ${user?.name?.split(' ')[0] || 'there'}</h1>
          <p class="view-description">Here's your organization's ESG performance at a glance</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary btn-sm" id="export-csv-btn">Export Report</button>
        </div>
      </div>

      <!-- KPI Grid: 6 cards -->
      <div class="grid-3" style="gap:16px;margin-bottom:24px;">
        <div class="dashboard-kpi" style="border-left:4px solid var(--accent-success);">
          <div class="kpi-label">Environmental Score</div>
          <div class="kpi-value-main">${Math.round(envScore)}<span class="kpi-unit">/100</span></div>
        </div>
        <div class="dashboard-kpi" style="border-left:4px solid #3B82F6;">
          <div class="kpi-label">Social Score</div>
          <div class="kpi-value-main">${Math.round(socScore)}<span class="kpi-unit">/100</span></div>
        </div>
        <div class="dashboard-kpi" style="border-left:4px solid #8B5CF6;">
          <div class="kpi-label">Governance Score</div>
          <div class="kpi-value-main">${Math.round(govScore)}<span class="kpi-unit">/100</span></div>
        </div>
        <div class="dashboard-kpi" style="border-left:4px solid #06B6D4;">
          <div class="kpi-label">Overall ESG Score</div>
          <div class="kpi-value-main">${Math.round(overallScore)}<span class="kpi-unit">/100</span></div>
        </div>
        <div class="dashboard-kpi" style="border-left:4px solid var(--accent-gamification);">
          <div class="kpi-label">Active Goals</div>
          <div class="kpi-value-main">${totals.activeGoals}</div>
        </div>
        <div class="dashboard-kpi" style="border-left:4px solid #EF4444;">
          <div class="kpi-label">Open Issues</div>
          <div class="kpi-value-main">${totals.openIssues}</div>
        </div>
      </div>

      <div class="grid-2" style="gap:20px;margin-bottom:24px;">
        <!-- Emissions Chart -->
        <div class="view-card chart-card">
          <div class="chart-card-header">
            <div class="chart-title-wrapper">
              <span>Monthly Carbon Emissions</span>
            </div>
          </div>
          <div class="chart-container">
            <svg class="emissions-svg" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10B981" stop-opacity="0.2"/>
                  <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="M 30 160 Q 70 110, 115 80 T 200 90 T 285 140 T 370 70 T 470 100 L 470 200 L 30 200 Z" fill="url(#area-gradient)" />
              <path class="trend-path" d="M 30 160 Q 70 110, 115 80 T 200 90 T 285 140 T 370 70 T 470 100" fill="none" stroke="var(--accent-success)" stroke-width="3" stroke-linecap="round" />
              <circle cx="30" cy="160" r="4" class="chart-node" style="fill:var(--accent-success);" />
              <circle cx="115" cy="80" r="4" class="chart-node" style="fill:var(--accent-success);" />
              <circle cx="200" cy="90" r="4" class="chart-node" style="fill:var(--accent-success);" />
              <circle cx="285" cy="140" r="4" class="chart-node" style="fill:var(--accent-success);" />
              <circle cx="370" cy="70" r="4" class="chart-node" style="fill:var(--accent-success);" />
              <circle cx="470" cy="100" r="4" class="chart-node" style="fill:var(--accent-success);" />
            </svg>
            <div class="chart-axis-labels">
              <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
            </div>
          </div>
        </div>

        <!-- ESG Score Donut -->
        <div class="view-card" style="display:flex;flex-direction:column;gap:16px;">
          <div class="chart-card-header">
            <div class="chart-title-wrapper">
              <span>ESG Score Breakdown</span>
            </div>
            <div style="text-align:right;">
              <div style="font-size:28px;font-weight:700;color:var(--accent-success);line-height:1;">${Math.round(overallScore)}</div>
              <div style="font-size:11px;color:var(--text-muted);">/ 100</div>
            </div>
          </div>
          <div class="donut-chart-container">
            <svg viewBox="0 0 200 200" style="width:160px;height:160px;margin:0 auto;">
              <circle cx="100" cy="100" r="70" fill="none" stroke="var(--border-color)" stroke-width="20"/>
              <circle cx="100" cy="100" r="70" fill="none" stroke="var(--accent-success)" stroke-width="20" stroke-dasharray="${(envScore / 100) * 440} ${440 - (envScore / 100) * 440}" stroke-dashoffset="110" transform="rotate(-90, 100, 100)" stroke-linecap="round"/>
              <circle cx="100" cy="100" r="46" fill="none" stroke="var(--border-color)" stroke-width="20"/>
              <circle cx="100" cy="100" r="46" fill="none" stroke="#3B82F6" stroke-width="20" stroke-dasharray="${(socScore / 100) * 289} ${289 - (socScore / 100) * 289}" stroke-dashoffset="72" transform="rotate(-90, 100, 100)" stroke-linecap="round"/>
              <text x="100" y="105" text-anchor="middle" font-size="24" font-weight="700" fill="var(--text-primary)">${Math.round(overallScore)}</text>
            </svg>
          </div>
          <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text-secondary);"><div style="width:10px;height:10px;border-radius:2px;background:var(--accent-success);"></div>Env: ${Math.round(envScore)}</div>
            <div style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text-secondary);"><div style="width:10px;height:10px;border-radius:2px;background:#3B82F6;"></div>Soc: ${Math.round(socScore)}</div>
            <div style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text-secondary);"><div style="width:10px;height:10px;border-radius:2px;background:#8B5CF6;"></div>Gov: ${Math.round(govScore)}</div>
          </div>
        </div>
      </div>

      <div class="grid-2" style="gap:20px;">
        <!-- Department Rankings -->
        <div class="view-card">
          <div class="card-title-header" style="margin-bottom:16px;">
            <h3 style="font-size:16px;font-weight:600;">Department ESG Rankings</h3>
          </div>
          ${departments.length > 0 ? departments.slice(0, 6).map((d, i) => `
            <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:${i < 5 ? '1px solid var(--border-color)' : 'none'};">
              <div style="width:24px;height:24px;border-radius:4px;background:${i === 0 ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)'};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:${i === 0 ? 'var(--accent-success)' : 'var(--text-muted)'};">${i + 1}</div>
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:500;">${d.fullName || d.name}</div>
                <div style="height:6px;background:var(--bg-secondary);border-radius:3px;margin-top:4px;">
                  <div style="height:100%;border-radius:3px;background:${i === 0 ? 'var(--accent-success)' : i === 1 ? '#3B82F6' : i === 2 ? '#8B5CF6' : 'var(--accent-gamification)'};width:${d.score}%;transition:width 0.5s;"></div>
                </div>
              </div>
              <div style="font-size:14px;font-weight:600;min-width:36px;text-align:right;">${Math.round(d.score)}</div>
            </div>
          `).join('') : '<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;">No department data yet</div>'}
        </div>

        <!-- Quick Actions + XP Card -->
        <div class="view-card">
          <div class="card-title-header" style="margin-bottom:16px;">
            <h3 style="font-size:16px;font-weight:600;">Quick Actions</h3>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${[
              { label: 'Log Emission', icon: '\u267B\uFE0F', path: '#environmental/carbon-transactions' },
              { label: 'Join CSR Activity', icon: '\u{1F91D}', path: '#social/csr-activities' },
              { label: 'View Challenges', icon: '\u{1F3AF}', path: '#gamification/challenges' },
              { label: 'Check Policies', icon: '\u{1F4CB}', path: '#governance/policies' },
              { label: 'Ask EcoBot', icon: '\u{1F4AC}', path: '#chatbot' },
              { label: 'View Reports', icon: '\u{1F4CA}', path: '#reports/esg-summary' },
            ].map(a => `
              <a href="${a.path}" class="quick-action-item">
                <span style="font-size:18px;">${a.icon}</span>
                <span>${a.label}</span>
              </a>
            `).join('')}
          </div>

          <!-- User XP Card -->
          ${user ? `
          <div class="user-xp-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:13px;font-weight:500;color:var(--accent-success);">Your XP</span>
              <span style="font-size:16px;font-weight:700;color:var(--accent-success);">${user.xp_points || 0}</span>
            </div>
            <div style="height:8px;background:rgba(16,185,129,0.15);border-radius:4px;">
              <div style="height:100%;border-radius:4px;background:var(--accent-success);width:${Math.min(((user.xp_points || 0) % 1000) / 10, 100)}%;transition:width 0.5s;"></div>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">
              ${1000 - ((user.xp_points || 0) % 1000)} XP to next level
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    </div>

    <style>
      .dashboard-kpi { background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:20px 24px; }
      .kpi-label { font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
      .kpi-value-main { font-size:30px; font-weight:800; color:var(--text-primary); }
      .kpi-unit { font-size:16px; font-weight:400; color:var(--text-muted); margin-left:4px; }
      .dashboard-kpi:hover .kpi-value-main { filter:brightness(1.2); }
      .chart-card { min-height:220px; }
      .chart-title-wrapper { font-size:14px; font-weight:600; color:var(--text-primary); }
      .emissions-svg { width:100%; height:120px; overflow:visible; }
      .chart-axis-labels { display:flex; justify-content:space-between; padding-top:8px; font-size:10px; color:var(--text-muted); font-weight:500; border-top:1px solid var(--border-color); }
      .chart-node { cursor:pointer; transition:r 0.15s, opacity 0.15s; }
      .chart-node:hover { r:7; opacity:0.8; }
      .quick-action-item { display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:var(--radius-sm); border:1px solid var(--border-color); text-decoration:none; color:var(--text-secondary); font-size:12px; font-weight:500; transition:background 0.15s; }
      .quick-action-item:hover { background:var(--bg-secondary); }
      .user-xp-card { margin-top:16px; padding:14px; background:rgba(16,185,129,0.06); border-radius:var(--radius-sm); border:1px solid rgba(16,185,129,0.12); }
    </style>
  `;

  const exportBtn = container.querySelector('#export-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportCSV);
  }

  if (window.lucide) window.lucide.createIcons();
}
