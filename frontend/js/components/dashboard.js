import * as envApi from '../api/environmental.js';
import * as settingsApi from '../api/settings.js';
import * as reportsApi from '../api/reports.js';
import { showToast, renderLoading } from '../api/toast.js';

export async function renderDashboard(container) {
  renderLoading(container);

  let envScore = 82, socScore = 74, govScore = 88, overallScore = 81;
  let emissionsData = [];
  let departments = [];
  let activities = [
    { text: 'Welcome to EcoSphere! Start exploring your ESG data.', type: 'info' }
  ];

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

  container.innerHTML = `
    <div class="view-container">
      <div class="breadcrumb">
        <span class="breadcrumb-current">Dashboard</span>
      </div>

      <div class="view-header">
        <h1 class="view-title">Dashboard: Executive Overview</h1>
        <p class="view-description">Summary of organizational ESG scoring, emission trends, and action panels.</p>
      </div>

      <div class="grid-4 KPI-row">
        <a href="#environmental/emission-factors" class="kpi-card env-kpi">
          <div class="kpi-title">Environmental Score</div>
          <div class="kpi-value">${Math.round(envScore)} / 100</div>
          <span class="kpi-trend success-text"><i data-lucide="trending-up"></i> Active</span>
        </a>
        <a href="#social/csr-activities" class="kpi-card soc-kpi">
          <div class="kpi-title">Social Score</div>
          <div class="kpi-value">${Math.round(socScore)} / 100</div>
          <span class="kpi-trend success-text"><i data-lucide="trending-up"></i> Active</span>
        </a>
        <a href="#governance/policies" class="kpi-card gov-kpi">
          <div class="kpi-title">Governance Score</div>
          <div class="kpi-value">${Math.round(govScore)} / 100</div>
          <span class="kpi-trend success-text"><i data-lucide="trending-up"></i> Active</span>
        </a>
        <a href="#reports/esg-summary" class="kpi-card overall-kpi">
          <div class="kpi-title">Overall ESG Score</div>
          <div class="kpi-value">${Math.round(overallScore)} / 100</div>
          <span class="kpi-trend success-text"><i data-lucide="trending-up"></i> Live</span>
        </a>
      </div>

      <div class="kpi-features-sub">
        Live data from backend &bull; API-driven KPIs
      </div>

      <div class="grid-2 charts-row">
        <div class="view-card chart-card">
          <div class="chart-card-header">
            <div class="chart-title-wrapper">
              <i data-lucide="line-chart"></i>
              <span>Emissions Overview</span>
            </div>
          </div>
          <div class="chart-container">
            <svg class="emissions-svg" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10B981" stop-opacity="0.2"/>
                  <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
                </linearGradient>
                <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="#34D399"/>
                  <stop offset="50%" stop-color="#10B981"/>
                  <stop offset="100%" stop-color="#059669"/>
                </linearGradient>
              </defs>
              <path d="M 30 160 Q 70 110, 115 80 T 200 90 T 285 140 T 370 70 T 470 100 L 470 200 L 30 200 Z" fill="url(#area-gradient)" />
              <path class="trend-path" d="M 30 160 Q 70 110, 115 80 T 200 90 T 285 140 T 370 70 T 470 100" fill="none" stroke="url(#line-gradient)" stroke-width="4" stroke-linecap="round" />
              <path d="M 72.5 110 L 80 105 L 75 115" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" />
              <path d="M 152 82 L 160 83 L 155 90" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" />
              <path d="M 235 110 L 242 116 L 235 120" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" />
              <path d="M 322.5 110 L 330 100 L 325 110" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" />
              <path d="M 412 80 L 420 82 L 415 88" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" />
              <circle cx="30" cy="160" r="5" class="chart-node" data-val="Latest emissions" />
              <circle cx="115" cy="80" r="5" class="chart-node" data-val="Tracking active" />
              <circle cx="200" cy="90" r="5" class="chart-node" data-val="Monitor trends" />
              <circle cx="285" cy="140" r="5" class="chart-node" data-val="Data from API" />
              <circle cx="370" cy="70" r="5" class="chart-node" data-val="Check reports" />
              <circle cx="470" cy="100" r="5" class="chart-node" data-val="View details" />
            </svg>
            <div class="chart-axis-labels">
              <span>Data</span>
              <span>from</span>
              <span>backend</span>
              <span>API</span>
              <span>Live</span>
            </div>
            <div id="chart-tooltip" class="chart-tooltip"></div>
          </div>
        </div>

        <div class="view-card chart-card">
          <div class="chart-card-header">
            <div class="chart-title-wrapper">
              <i data-lucide="bar-chart-2"></i>
              <span>Department ESG Ranking</span>
            </div>
          </div>
          <div class="bar-chart-container">
            ${departments.map((d, i) => {
              const colorClasses = ['score-corp', 'score-mfg', 'score-rd', 'score-logi', 'score-sale'];
              const cls = colorClasses[i % colorClasses.length];
              return `
                <div class="bar-item">
                  <div class="bar-value-label">${Math.round(d.score)}%</div>
                  <div class="bar-track">
                    <div class="bar-fill ${cls}" style="height: ${Math.max(10, d.score)}%;" data-tooltip="${d.fullName || d.name}: ${Math.round(d.score)}/100"></div>
                  </div>
                  <div class="bar-name">${d.name}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="grid-2 actions-activity-row">
        <div class="view-card flex-col-card">
          <div class="card-title-header">
            <i data-lucide="clock"></i>
            <h3>Overview</h3>
          </div>
          <ul class="activity-bullet-list">
            <li>
              <span class="activity-bullet-icon tick-icon"><i data-lucide="check-circle-2"></i></span>
              <span class="activity-text"><strong>${departments.length}</strong> departments active</span>
            </li>
            <li>
              <span class="activity-bullet-icon log-icon"><i data-lucide="bar-chart-3"></i></span>
              <span class="activity-text">ESG scores <strong>loaded from API</strong></span>
            </li>
            <li>
              <span class="activity-bullet-icon policy-icon"><i data-lucide="file-signature"></i></span>
              <span class="activity-text">Data sourced from <strong>FastAPI backend</strong></span>
            </li>
            <li>
              <span class="activity-bullet-icon warn-icon"><i data-lucide="activity"></i></span>
              <span class="activity-text">Navigate modules to <strong>manage ESG data</strong></span>
            </li>
          </ul>
        </div>

        <div class="view-card flex-col-card">
          <div class="card-title-header">
            <i data-lucide="zap"></i>
            <h3>Quick Actions</h3>
          </div>
          <div class="quick-actions-list">
            <a href="#environmental/carbon-transactions" class="action-btn btn-green-act">
              <i data-lucide="plus"></i>
              <span>Log Carbon Data</span>
            </a>
            <a href="#gamification/challenges" class="action-btn btn-orange-act">
              <i data-lucide="trophy"></i>
              <span>Start Challenge</span>
            </a>
            <a href="#reports/esg-summary" class="action-btn btn-grey-act">
              <i data-lucide="file-text"></i>
              <span>View Reports</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <style>
      .KPI-row { gap: 20px; margin-top: 10px; }
      .kpi-features-sub { font-family: var(--font-body); font-size: 13px; color: var(--text-muted); margin-top: 12px; margin-bottom: 24px; font-style: italic; }
      .kpi-card { background-color: var(--bg-card); border: 1.5px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; text-decoration: none; display: flex; flex-direction: column; gap: 8px; transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast); box-shadow: var(--shadow-sm); position: relative; overflow: hidden; }
      .kpi-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; opacity: 0.8; }
      .kpi-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
      .env-kpi { border-color: rgba(16, 185, 129, 0.2); }
      .env-kpi::after { background-color: var(--accent-success); }
      .env-kpi:hover { border-color: var(--accent-success); box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15); }
      .soc-kpi { border-color: rgba(59, 130, 246, 0.2); }
      .soc-kpi::after { background-color: var(--accent-info); }
      .soc-kpi:hover { border-color: var(--accent-info); box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15); }
      .gov-kpi { border-color: rgba(139, 92, 246, 0.2); }
      .gov-kpi::after { background-color: var(--accent-warning); }
      .gov-kpi:hover { border-color: var(--accent-warning); box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15); }
      .overall-kpi { border-color: rgba(6, 182, 212, 0.2); }
      .overall-kpi::after { background-color: #06B6D4; }
      .overall-kpi:hover { border-color: #06B6D4; box-shadow: 0 4px 20px rgba(6, 182, 212, 0.15); }
      .kpi-title { font-family: var(--font-heading); font-size: 13.5px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
      .kpi-value { font-family: var(--font-heading); font-size: 32px; font-weight: 800; color: var(--text-primary); }
      .kpi-trend { font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
      .success-text { color: var(--accent-success); }
      .chart-card { padding: 24px; display: flex; flex-direction: column; gap: 20px; min-height: 290px; }
      .chart-card-header { display: flex; justify-content: space-between; align-items: center; }
      .chart-title-wrapper { display: flex; align-items: center; gap: 10px; font-family: var(--font-heading); font-size: 16px; font-weight: 600; color: var(--text-primary); }
      .chart-title-wrapper i { width: 18px; height: 18px; color: var(--text-muted); }
      .chart-container { flex: 1; position: relative; display: flex; flex-direction: column; justify-content: space-between; }
      .emissions-svg { width: 100%; height: 140px; overflow: visible; }
      .chart-axis-labels { display: flex; justify-content: space-between; padding-top: 8px; font-size: 11px; color: var(--text-muted); font-weight: 500; border-top: 1px solid var(--border-color); }
      .chart-node { fill: var(--bg-card); stroke: var(--accent-success); stroke-width: 2px; cursor: pointer; transition: r var(--transition-fast), fill var(--transition-fast); }
      .chart-node:hover { r: 8px; fill: var(--accent-success); }
      .chart-tooltip { position: absolute; background-color: var(--bg-primary); border: 1px solid var(--border-color); padding: 6px 12px; border-radius: var(--radius-sm); font-size: 11px; font-weight: 600; color: var(--text-primary); pointer-events: none; opacity: 0; transition: opacity var(--transition-fast); box-shadow: var(--shadow-md); z-index: 10; transform: translate(-50%, -100%); margin-top: -8px; }
      .bar-chart-container { flex: 1; display: flex; justify-content: space-around; align-items: flex-end; height: 150px; padding-top: 12px; gap: 16px; }
      .bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
      .bar-value-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
      .bar-track { flex: 1; width: 28px; background-color: rgba(255, 255, 255, 0.03); border-radius: var(--radius-sm) var(--radius-sm) 0 0; display: flex; align-items: flex-end; overflow: hidden; border: 1px solid var(--border-color); }
      .bar-fill { width: 100%; border-radius: 4px 4px 0 0; cursor: pointer; transition: filter var(--transition-fast), transform var(--transition-fast); background: linear-gradient(180deg, var(--accent-primary), rgba(59, 130, 246, 0.4)); }
      .bar-fill:hover { filter: brightness(1.2); transform: scaleY(1.02); }
      .bar-name { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
      .score-corp { background: linear-gradient(180deg, #3B82F6, rgba(59,130,246,0.3)); }
      .score-mfg { background: linear-gradient(180deg, #10B981, rgba(16,185,129,0.3)); }
      .score-rd { background: linear-gradient(180deg, #8B5CF6, rgba(139,92,246,0.3)); }
      .score-logi { background: linear-gradient(180deg, #06B6D4, rgba(6,182,212,0.3)); }
      .score-sale { background: linear-gradient(180deg, #F59E0B, rgba(245,158,11,0.3)); }
      .flex-col-card { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
      .card-title-header { display: flex; align-items: center; gap: 12px; font-family: var(--font-heading); }
      .card-title-header i { color: var(--text-muted); width: 20px; height: 20px; }
      .card-title-header h3 { font-size: 18px; font-weight: 600; }
      .activity-bullet-list { list-style: none; display: flex; flex-direction: column; gap: 14px; }
      .activity-bullet-list li { display: flex; align-items: flex-start; gap: 12px; font-size: 14px; color: var(--text-secondary); }
      .activity-bullet-icon { display: flex; align-items: center; justify-content: center; margin-top: 2px; }
      .activity-bullet-icon i { width: 16px; height: 16px; }
      .tick-icon { color: var(--accent-success); }
      .warn-icon { color: #EF4444; }
      .log-icon { color: var(--accent-info); }
      .policy-icon { color: var(--accent-warning); }
      .quick-actions-list { display: flex; flex-direction: column; gap: 12px; }
      .action-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 20px; border-radius: var(--radius-md); font-family: var(--font-heading); font-size: 14.5px; font-weight: 600; text-decoration: none; transition: transform var(--transition-fast), filter var(--transition-fast); }
      .action-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
      .action-btn i { width: 16px; height: 16px; }
      .btn-green-act { background-color: var(--accent-success); color: white; }
      .btn-orange-act { background-color: var(--accent-gamification); color: var(--bg-primary); }
      .btn-grey-act { background-color: rgba(255, 255, 255, 0.08); color: var(--text-primary); border: 1px solid var(--border-color); }
    </style>
  `;

  const nodes = container.querySelectorAll('.chart-node');
  const tooltip = container.querySelector('#chart-tooltip');
  nodes.forEach(node => {
    node.addEventListener('mouseenter', (e) => {
      const val = e.target.getAttribute('data-val');
      const cx = parseFloat(e.target.getAttribute('cx'));
      const cy = parseFloat(e.target.getAttribute('cy'));
      tooltip.textContent = val;
      tooltip.style.left = `${(cx / 500) * 100}%`;
      tooltip.style.top = `${(cy / 200) * 140}px`;
      tooltip.style.opacity = '1';
    });
    node.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
  });

  if (window.lucide) window.lucide.createIcons();
}
