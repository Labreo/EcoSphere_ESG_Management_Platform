/**
 * EcoSphere Gamification Module View Component
 */

export function renderGamificationPage(container, pageKey) {
  let contentHtml = '';

  if (pageKey === 'challenges') {
    contentHtml = renderChallenges();
  } else if (pageKey === 'challenge-participation') {
    contentHtml = renderChallengeParticipation();
  } else if (pageKey === 'badges') {
    contentHtml = renderBadges();
  } else if (pageKey === 'rewards') {
    contentHtml = renderRewards();
  } else if (pageKey === 'leaderboard') {
    contentHtml = renderLeaderboard();
  }

  container.innerHTML = `
    <div class="view-container">
      <div class="view-header">
        <h1 class="view-title">${getGamificationTitle(pageKey)}</h1>
        <p class="view-description">${getGamificationDesc(pageKey)}</p>
      </div>
      ${contentHtml}
    </div>
  `;
}

function getGamificationTitle(key) {
  switch (key) {
    case 'challenges': return 'Sustainability Challenges';
    case 'challenge-participation': return 'Challenge Participation';
    case 'badges': return 'Employee Badges';
    case 'rewards': return 'Rewards Store';
    case 'leaderboard': return 'ESG Leaderboard';
    default: return 'Gamification';
  }
}

function getGamificationDesc(key) {
  switch (key) {
    case 'challenges': return 'Complete real-world carbon and environment actions to earn XP points and unlock achievements.';
    case 'challenge-participation': return 'Review submitted evidence files and verify completed employee challenges.';
    case 'badges': return 'Collectible badges unlocked dynamically as your XP and activity milestones increase.';
    case 'rewards': return 'Spend your earned sustainability points to redeem physical and digital green rewards.';
    case 'leaderboard': return 'See the top individual employees and department averages ranking the organization\'s engagement.';
    default: return 'Gamification parameters and rules.';
  }
}

// ----------------------------------------------------
// Page Renders
// ----------------------------------------------------

function renderChallenges() {
  return `
    <div class="table-actions">
      <div class="filters-row">
        <select class="filter-dropdown">
          <option>All Difficulties</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>
      <button class="btn btn-gamify"><i data-lucide="plus"></i> Create Challenge</button>
    </div>

    <div class="grid-3">
      <div class="glass-card challenge-card">
        <div class="c-card-header">
          <span class="difficulty-tag diff-easy">Easy</span>
          <span class="points-badge">100 XP</span>
        </div>
        <h4 class="challenge-title">The Paperless Office</h4>
        <p class="challenge-desc">Avoid printing any documents for 5 consecutive workdays. Submit your digital doc archive count as proof.</p>
        <div class="challenge-meta">
          <span>Category: Office Green</span>
          <span>Deadline: July 20, 2026</span>
        </div>
        <button class="btn btn-gamify full-width">Join Challenge</button>
      </div>

      <div class="glass-card challenge-card">
        <div class="c-card-header">
          <span class="difficulty-tag diff-medium">Medium</span>
          <span class="points-badge">250 XP</span>
        </div>
        <h4 class="challenge-title">Car-free Commute Week</h4>
        <p class="challenge-desc">Use public transport, bike, or walk to work for 4 days this week. Submit bus ticket photos or cycling logs.</p>
        <div class="challenge-meta">
          <span>Category: Transport</span>
          <span>Deadline: July 18, 2026</span>
        </div>
        <button class="btn btn-gamify full-width">Join Challenge</button>
      </div>

      <div class="glass-card challenge-card">
        <div class="c-card-header">
          <span class="difficulty-tag diff-hard">Hard</span>
          <span class="points-badge">500 XP</span>
        </div>
        <h4 class="challenge-title">Energy Audit Champion</h4>
        <p class="challenge-desc">Perform an appliance power standby check at your department office, listing savings recommendations.</p>
        <div class="challenge-meta">
          <span>Category: Electricity</span>
          <span>Deadline: August 01, 2026</span>
        </div>
        <button class="btn btn-gamify full-width">Join Challenge</button>
      </div>
    </div>

    <style>${getGamificationCSS()}</style>
  `;
}

function renderChallengeParticipation() {
  return `
    <div class="grid-3">
      <div class="glass-card stat-box border-gamify">
        <span class="stat-lbl">Active Participations</span>
        <h3>34</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Submissions Pending Review</span>
        <h3>3</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Total XP Distributed</span>
        <h3>42,500 XP</h3>
      </div>
    </div>

    <div class="view-card">
      <div class="card-header">
        <h3>Challenge Submissions</h3>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Challenge Title</th>
              <th>Evidence Provided</th>
              <th>Status</th>
              <th>XP Value</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Mark Robinson</strong></td>
              <td>Car-free Commute Week</td>
              <td><a href="#" class="proof-link"><i data-lucide="image"></i> commute_log_strava.png</a></td>
              <td><span class="status-tag status-tag-pending">Under Review</span></td>
              <td>250 XP</td>
              <td>
                <div class="action-buttons-group">
                  <button class="action-btn-mini btn-approve"><i data-lucide="check"></i></button>
                  <button class="action-btn-mini btn-reject"><i data-lucide="x"></i></button>
                </div>
              </td>
            </tr>
            <tr>
              <td><strong>Sarah Jenkins</strong></td>
              <td>The Paperless Office</td>
              <td><a href="#" class="proof-link"><i data-lucide="file"></i> digital_notes_folder.pdf</a></td>
              <td><span class="status-tag status-tag-active">Approved</span></td>
              <td>100 XP</td>
              <td><span class="verified-text"><i data-lucide="sparkles"></i> XP Awarded</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style>${getGamificationCSS()}</style>
  `;
}

function renderBadges() {
  return `
    <div class="grid-4">
      <div class="glass-card badge-gallery-card unlocked">
        <div class="badge-icon-large">🌿</div>
        <h4>Green Initiate</h4>
        <p>Complete your first carbon logging event.</p>
        <span class="badge-rule">Unlock: Log 1 carbon transaction</span>
        <span class="badge-status-tag">Unlocked</span>
      </div>

      <div class="glass-card badge-gallery-card unlocked">
        <div class="badge-icon-large">🚴</div>
        <h4>Commute Champion</h4>
        <p>Adopt zero-emission transport solutions.</p>
        <span class="badge-rule">Unlock: Complete 'Car-free Commute'</span>
        <span class="badge-status-tag">Unlocked</span>
      </div>

      <div class="glass-card badge-gallery-card unlocked">
        <div class="badge-icon-large">🏆</div>
        <h4>XP Centurion</h4>
        <p>Earn 1,000 XP in sustainability points.</p>
        <span class="badge-rule">Unlock: Accumulate 1,000 XP</span>
        <span class="badge-status-tag">Unlocked</span>
      </div>

      <div class="glass-card badge-gallery-card locked">
        <div class="badge-icon-large">🏛️</div>
        <h4>Governance Sentry</h4>
        <p>Sign all policy guidelines instantly.</p>
        <span class="badge-rule">Unlock: 100% Policy signatures</span>
        <span class="badge-status-tag">Locked</span>
      </div>
    </div>

    <style>${getGamificationCSS()}</style>
  `;
}

function renderRewards() {
  return `
    <div class="grid-3">
      <div class="glass-card reward-store-card">
        <div class="reward-media">☕</div>
        <div class="reward-body">
          <span class="reward-cost">200 Points</span>
          <h4>Re-usable Bamboo Coffee Cup</h4>
          <p>Get a double-walled branded bamboo mug for your daily commute coffee run.</p>
          <div class="reward-stock-row">
            <span class="stock-count">Stock: 12 units</span>
            <button class="btn btn-gamify">Redeem Reward</button>
          </div>
        </div>
      </div>

      <div class="glass-card reward-store-card">
        <div class="reward-media">🚲</div>
        <div class="reward-body">
          <span class="reward-cost">1,000 Points</span>
          <h4>1-Month City Bike Share Pass</h4>
          <p>Redeem code for a free 30-day city cycle rentals membership. Promotes zero carbon travel.</p>
          <div class="reward-stock-row">
            <span class="stock-count">Stock: 8 units</span>
            <button class="btn btn-gamify">Redeem Reward</button>
          </div>
        </div>
      </div>

      <div class="glass-card reward-store-card">
        <div class="reward-media">🌲</div>
        <div class="reward-body">
          <span class="reward-cost">300 Points</span>
          <h4>Plant a Tree in Your Name</h4>
          <p>We work with OneTreePlanted to place an indigenous species tree. You get a certificate.</p>
          <div class="reward-stock-row">
            <span class="stock-count">Unlimited Stock</span>
            <button class="btn btn-gamify">Redeem Reward</button>
          </div>
        </div>
      </div>
    </div>

    <style>${getGamificationCSS()}</style>
  `;
}

function renderLeaderboard() {
  return `
    <div class="grid-2">
      <!-- Individual Leaderboard -->
      <div class="view-card">
        <div class="card-header">
          <h3>Individual Leaderboard</h3>
        </div>
        <div class="list-container">
          <div class="list-item">
            <div class="leaderboard-rank rank-1">1</div>
            <div class="user-avatar-small">AM</div>
            <div class="item-info">
              <strong>Alex Morgan</strong>
              <span class="item-sub">Product Design &bull; 4 Badges</span>
            </div>
            <span class="points-badge">1,480 XP</span>
          </div>
          <div class="list-item">
            <div class="leaderboard-rank rank-2">2</div>
            <div class="user-avatar-small">SK</div>
            <div class="item-info">
              <strong>Sarah K.</strong>
              <span class="item-sub">Engineering &bull; 3 Badges</span>
            </div>
            <span class="points-badge">1,310 XP</span>
          </div>
          <div class="list-item">
            <div class="leaderboard-rank rank-3">3</div>
            <div class="user-avatar-small">JD</div>
            <div class="item-info">
              <strong>Jane Doe</strong>
              <span class="item-sub">Sustainability Admin &bull; 3 Badges</span>
            </div>
            <span class="points-badge">1,250 XP</span>
          </div>
        </div>
      </div>

      <!-- Department Leaderboard -->
      <div class="view-card">
        <div class="card-header">
          <h3>Department ESG Average Scores</h3>
        </div>
        <div class="list-container">
          <div class="list-item">
            <div class="leaderboard-rank rank-1">1</div>
            <div class="item-info">
              <strong>Product Design & R&D</strong>
              <span class="item-sub">Env: 86 | Soc: 82 | Gov: 94</span>
            </div>
            <span class="points-badge badge-green">87.3 / 100</span>
          </div>
          <div class="list-item">
            <div class="leaderboard-rank rank-2">2</div>
            <div class="item-info">
              <strong>Finance & Operations</strong>
              <span class="item-sub">Env: 78 | Soc: 74 | Gov: 88</span>
            </div>
            <span class="points-badge badge-green">80.0 / 100</span>
          </div>
          <div class="list-item">
            <div class="leaderboard-rank rank-3">3</div>
            <div class="item-info">
              <strong>Logistics & Supply</strong>
              <span class="item-sub">Env: 64 | Soc: 72 | Gov: 91</span>
            </div>
            <span class="points-badge badge-green">75.7 / 100</span>
          </div>
        </div>
      </div>
    </div>

    <style>${getGamificationCSS()}</style>
  `;
}

function getGamificationCSS() {
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
    .btn-gamify {
      background-color: var(--accent-gamification);
      color: var(--bg-primary);
    }
    .btn-gamify:hover {
      background-color: #d97706;
    }
    .full-width {
      width: 100%;
      justify-content: center;
    }

    /* Challenge card */
    .challenge-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .c-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .difficulty-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
    }
    .diff-easy { background-color: rgba(16, 185, 129, 0.15); color: var(--accent-success); }
    .diff-medium { background-color: rgba(59, 130, 246, 0.15); color: var(--accent-info); }
    .diff-hard { background-color: rgba(239, 68, 68, 0.15); color: var(--accent-danger); }
    
    .points-badge {
      background-color: rgba(245, 158, 11, 0.15);
      color: var(--accent-gamification);
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 700;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    .badge-green {
      background-color: rgba(16, 185, 129, 0.15);
      color: var(--accent-success);
      border-color: rgba(16, 185, 129, 0.2);
    }
    .challenge-title {
      font-family: var(--font-heading);
      font-size: 17px;
      font-weight: 600;
    }
    .challenge-desc {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
      flex-grow: 1;
    }
    .challenge-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
      padding-top: 10px;
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
    .border-gamify {
      border-color: rgba(245, 158, 11, 0.2);
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
      color: var(--accent-gamification);
      text-decoration: none;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .proof-link:hover {
      text-decoration: underline;
    }
    .action-buttons-group {
      display: flex;
      gap: 6px;
    }
    .action-btn-mini {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
    }
    .btn-approve {
      background-color: var(--accent-success);
    }
    .btn-approve:hover { background-color: #059669; }
    .btn-reject {
      background-color: var(--accent-danger);
    }
    .btn-reject:hover { background-color: #dc2626; }
    .verified-text {
      color: var(--accent-success);
      font-size: 13px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .verified-text i {
      width: 14px;
      height: 14px;
    }

    /* Badge Grid */
    .badge-gallery-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
    }
    .badge-icon-large {
      font-size: 42px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .badge-gallery-card.locked {
      opacity: 0.4;
    }
    .badge-gallery-card.locked .badge-icon-large {
      filter: grayscale(100%);
    }
    .badge-gallery-card h4 {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 600;
    }
    .badge-gallery-card p {
      font-size: 12.5px;
      color: var(--text-secondary);
      line-height: 1.4;
      flex-grow: 1;
    }
    .badge-rule {
      font-size: 11px;
      color: var(--text-muted);
      background-color: rgba(0,0,0,0.15);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }
    .badge-status-tag {
      font-size: 11px;
      font-weight: 700;
    }
    .unlocked .badge-status-tag {
      color: var(--accent-success);
    }
    .locked .badge-status-tag {
      color: var(--text-muted);
    }

    /* Reward card */
    .reward-store-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
    }
    .reward-media {
      height: 140px;
      background-color: rgba(255, 255, 255, 0.02);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 64px;
      border-bottom: 1px solid var(--border-color);
    }
    .reward-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex-grow: 1;
    }
    .reward-cost {
      background-color: rgba(245, 158, 11, 0.15);
      color: var(--accent-gamification);
      font-size: 11px;
      font-weight: 700;
      align-self: flex-start;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }
    .reward-body h4 {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 600;
    }
    .reward-body p {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.4;
      flex-grow: 1;
    }
    .reward-stock-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px solid var(--border-color);
      padding-top: 12px;
    }
    .stock-count {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Leaderboard CSS */
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
  `;
}
