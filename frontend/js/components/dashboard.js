/**
 * EcoSphere Dashboard View Component
 */

export function renderDashboard(container) {
  container.innerHTML = `
    <div class="view-container">
      <!-- Welcome Header -->
      <div class="view-header">
        <h1 class="view-title">Welcome Back, Jane!</h1>
        <p class="view-description">Here is your organization's sustainability profile and ESG metrics for this month.</p>
      </div>

      <!-- Overall ESG Score Widget -->
      <div class="glass-card esg-score-hero" style="background: linear-gradient(135deg, rgba(22, 28, 45, 0.8), rgba(16, 24, 39, 0.9)); border-color: rgba(59, 130, 246, 0.2);">
        <div class="esg-hero-content">
          <div class="esg-hero-text">
            <span class="esg-hero-tag">Active Platform Score</span>
            <h2>Overall ESG Performance</h2>
            <p>Calculated based on Environmental (40%), Social (30%), and Governance (30%) weighting configuration.</p>
            <div class="esg-breakdown-mini">
              <div class="mini-stat">
                <span class="dot env-dot"></span>
                <span>Env: <strong>82/100</strong></span>
              </div>
              <div class="mini-stat">
                <span class="dot soc-dot"></span>
                <span>Soc: <strong>76/100</strong></span>
              </div>
              <div class="mini-stat">
                <span class="dot gov-dot"></span>
                <span>Gov: <strong>91/100</strong></span>
              </div>
            </div>
          </div>
          <div class="esg-hero-radial">
            <div class="radial-circle">
              <span class="radial-number">83</span>
              <span class="radial-label">GRADE A</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid-4">
        <div class="glass-card metric-card">
          <div class="metric-icon env-icon"><i data-lucide="co2"></i></div>
          <div class="metric-details">
            <span class="metric-label">Carbon Reduced</span>
            <h3 class="metric-value">12.4 Tons</h3>
            <span class="metric-change success-text"><i data-lucide="trending-down"></i> -8.2% vs last month</span>
          </div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-icon soc-icon"><i data-lucide="heart-handshake"></i></div>
          <div class="metric-details">
            <span class="metric-label">CSR Participation</span>
            <h3 class="metric-value">68%</h3>
            <span class="metric-change success-text"><i data-lucide="trending-up"></i> +4.1% vs last quarter</span>
          </div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-icon gov-icon"><i data-lucide="shield-check"></i></div>
          <div class="metric-details">
            <span class="metric-label">Compliance Rate</span>
            <h3 class="metric-value">98.5%</h3>
            <span class="metric-change neutral-text"><i data-lucide="minus"></i> Unchanged</span>
          </div>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-icon gamification-icon"><i data-lucide="award"></i></div>
          <div class="metric-details">
            <span class="metric-label">Completed Challenges</span>
            <h3 class="metric-value">245</h3>
            <span class="metric-change success-text"><i data-lucide="trending-up"></i> +12% this week</span>
          </div>
        </div>
      </div>

      <!-- Interactive Layout columns -->
      <div class="grid-2">
        <!-- Recent Carbon Transactions -->
        <div class="view-card">
          <div class="card-header">
            <h3>Recent Carbon Activities</h3>
            <a href="#environmental/carbon-transactions" class="card-action-btn">View All</a>
          </div>
          <div class="list-container">
            <div class="list-item">
              <div class="item-info">
                <strong>Facility Electricity</strong>
                <span class="item-sub">Scope 2 Indirect &bull; Logistics HQ</span>
              </div>
              <div class="item-meta text-right">
                <span class="item-value">4.21 tCO2e</span>
                <span class="item-sub">2 hours ago</span>
              </div>
            </div>
            <div class="list-item">
              <div class="item-info">
                <strong>Corporate Fleet Fuel</strong>
                <span class="item-sub">Scope 1 Direct &bull; Sales Dept</span>
              </div>
              <div class="item-meta text-right">
                <span class="item-value">1.85 tCO2e</span>
                <span class="item-sub">1 day ago</span>
              </div>
            </div>
            <div class="list-item">
              <div class="item-info">
                <strong>Air Travel - Client Meeting</strong>
                <span class="item-sub">Scope 3 Business Travel &bull; R&D</span>
              </div>
              <div class="item-meta text-right">
                <span class="item-value">0.92 tCO2e</span>
                <span class="item-sub">2 days ago</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Leaderboard Preview -->
        <div class="view-card">
          <div class="card-header">
            <h3>Top Active Contributors</h3>
            <a href="#gamification/leaderboard" class="card-action-btn">Full Leaderboard</a>
          </div>
          <div class="list-container">
            <div class="list-item">
              <div class="leaderboard-rank rank-1">1</div>
              <div class="user-avatar-small">AM</div>
              <div class="item-info">
                <strong>Alex Morgan</strong>
                <span class="item-sub">Product Design &bull; 4 Badges</span>
              </div>
              <div class="item-meta text-right">
                <span class="points-badge">1,480 XP</span>
              </div>
            </div>
            <div class="list-item">
              <div class="leaderboard-rank rank-2">2</div>
              <div class="user-avatar-small">SK</div>
              <div class="item-info">
                <strong>Sarah K.</strong>
                <span class="item-sub">Engineering &bull; 3 Badges</span>
              </div>
              <div class="item-meta text-right">
                <span class="points-badge">1,310 XP</span>
              </div>
            </div>
            <div class="list-item">
              <div class="leaderboard-rank rank-3">3</div>
              <div class="user-avatar-small">JD</div>
              <div class="item-info">
                <strong>Jane Doe (You)</strong>
                <span class="item-sub">Sustainability Admin &bull; 3 Badges</span>
              </div>
              <div class="item-meta text-right">
                <span class="points-badge">1,250 XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
      .esg-score-hero {
        padding: 32px;
        position: relative;
      }
      .esg-hero-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
      }
      .esg-hero-text h2 {
        font-family: var(--font-heading);
        font-size: 28px;
        margin: 8px 0;
      }
      .esg-hero-text p {
        color: var(--text-secondary);
        font-size: 14px;
        margin-bottom: 20px;
        max-width: 550px;
      }
      .esg-hero-tag {
        background-color: rgba(59, 130, 246, 0.15);
        color: var(--accent-primary);
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: var(--radius-full);
      }
      .esg-breakdown-mini {
        display: flex;
        gap: 20px;
      }
      .mini-stat {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .env-dot { background-color: var(--accent-success); }
      .soc-dot { background-color: var(--accent-info); }
      .gov-dot { background-color: var(--accent-warning); }
      
      .esg-hero-radial {
        flex-shrink: 0;
      }
      .radial-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: radial-gradient(circle, var(--bg-card) 60%, transparent 62%),
                    conic-gradient(var(--accent-success) 0% 83%, rgba(255,255,255,0.05) 83% 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-glow);
        border: 1px solid rgba(255,255,255,0.05);
      }
      .radial-number {
        font-family: var(--font-heading);
        font-size: 36px;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
      }
      .radial-label {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1px;
        color: var(--accent-success);
        margin-top: 4px;
      }
      
      /* Metric Cards */
      .metric-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
      }
      .metric-icon {
        width: 46px;
        height: 46px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }
      .env-icon { background: rgba(16, 185, 129, 0.1); color: var(--accent-success); }
      .soc-icon { background: rgba(59, 130, 246, 0.1); color: var(--accent-info); }
      .gov-icon { background: rgba(139, 92, 246, 0.1); color: var(--accent-warning); }
      .gamification-icon { background: rgba(245, 158, 11, 0.1); color: var(--accent-gamification); }
      
      .metric-details {
        flex: 1;
      }
      .metric-label {
        font-size: 12px;
        color: var(--text-secondary);
      }
      .metric-value {
        font-family: var(--font-heading);
        font-size: 20px;
        font-weight: 700;
        margin: 2px 0;
      }
      .metric-change {
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .success-text { color: var(--accent-success); }
      .neutral-text { color: var(--text-muted); }
      .metric-change i { width: 12px; height: 12px; }

      /* Cards list layouts */
      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
      .card-header h3 {
        font-family: var(--font-heading);
        font-size: 18px;
        font-weight: 600;
      }
      .card-action-btn {
        font-size: 13px;
        color: var(--accent-primary);
        text-decoration: none;
        font-weight: 500;
      }
      .card-action-btn:hover {
        text-decoration: underline;
      }
      
      .list-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .list-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.02);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
      }
      .item-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .item-info strong {
        font-size: 14px;
        color: var(--text-primary);
      }
      .item-sub {
        font-size: 12px;
        color: var(--text-secondary);
      }
      .item-meta {
        font-size: 13px;
      }
      .item-value {
        display: block;
        font-weight: 600;
        color: var(--text-primary);
      }
      .text-right {
        text-align: right;
      }
      
      .leaderboard-rank {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 12px;
      }
      .rank-1 { background-color: rgba(245, 158, 11, 0.15); color: var(--accent-gamification); border: 1px solid rgba(245, 158, 11, 0.3); }
      .rank-2 { background-color: rgba(255, 255, 255, 0.1); color: var(--text-primary); }
      .rank-3 { background-color: rgba(255, 255, 255, 0.05); color: var(--text-secondary); }
      
      .user-avatar-small {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
      }
      .points-badge {
        background-color: rgba(59, 130, 246, 0.1);
        color: var(--accent-primary);
        padding: 4px 8px;
        border-radius: var(--radius-full);
        font-size: 11px;
        font-weight: 600;
      }
      
      @media (max-width: 768px) {
        .esg-hero-content {
          flex-direction: column;
          align-items: flex-start;
        }
        .esg-hero-radial {
          align-self: center;
        }
      }
    </style>
  `;
}
