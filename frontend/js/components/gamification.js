import * as api from '../api/gamification.js';
import * as settingsApi from '../api/settings.js';
import { showToast, renderLoading } from '../api/toast.js';
import { getStoredUser } from '../api/auth.js';

let employees = {};
let challenges = [];
let participations = [];
let badges = [];
let rewards = [];
let redemptions = [];
let notifications = [];
let activeFilterStatus = 'All';
let currentUser = '';

// ----------------------------------------------------
// UI Logic Helper Functions
// ----------------------------------------------------
function getInitials(name) {
  return name ? name.split(' ').map(n => n[0]).join('') : 'U';
}

function checkAndAwardBadges(employeeName) {
  const employee = employees[employeeName];
  if (!employee) return [];

  // Check the Badge Auto-Award toggle from Settings
  const esgSettings = JSON.parse(localStorage.getItem('esg_settings') || '{}');
  const badgeAutoAward = esgSettings.badgeAutoAward !== false; // default true

  if (!badgeAutoAward) {
    // Auto-award is disabled — skip automatic badge evaluation
    return [];
  }

  const completedChallengesCount = participations.filter(
    p => p.employee === employeeName && p.status === 'Approved'
  ).length;

  const newlyAwarded = [];

  badges.forEach(badge => {
    if (employee.badges.includes(badge.id)) return; // Already unlocked

    let shouldUnlock = false;
    if (badge.id === 'badge1') {
      const joinedCount = participations.filter(p => p.employee === employeeName).length;
      if (joinedCount >= 1) shouldUnlock = true;
    } else if (badge.id === 'badge2') {
      if (employee.xp >= 100) shouldUnlock = true;
    } else if (badge.id === 'badge3') {
      if (employee.xp >= 1000) shouldUnlock = true;
    } else if (badge.id === 'badge4') {
      if (completedChallengesCount >= 2) shouldUnlock = true;
    }

    if (shouldUnlock) {
      employee.badges.push(badge.id);
      newlyAwarded.push(badge.name);

      // Log in-app notification
      notifications.unshift({
        id: 'notif_' + Date.now() + '_' + Math.random(),
        text: `🎉 Achievement: ${employeeName} unlocked "${badge.name}" badge!`,
        date: new Date().toISOString().split('T')[0],
        type: 'badge'
      });

      // Fire email alert if enabled in notification settings
      const notifSettings = esgSettings.notifications || {};
      if (notifSettings.badgeUnlocks_email) {
        console.log(`✉️ Email alert sent: ${employeeName} unlocked "${badge.name}" badge.`);
      }
    }
  });

  if (newlyAwarded.length > 0) {
    
  }
  return newlyAwarded;
}

// ----------------------------------------------------
// Main View Export Render Function
// ----------------------------------------------------
export async function renderGamificationPage(container, pageKey) {
  if (!pageKey) pageKey = 'challenges';
  renderLoading(container);
  try {
    const [chs, bgs, rws, ldr] = await Promise.all([
      api.getChallenges(),
      api.getBadges(),
      api.getRewards(),
      api.getLeaderboard(),
    ]);
    challenges = chs;
    badges = bgs;
    rewards = rws;
    const user = getStoredUser();
    currentUser = user ? user.name : '';
    if (ldr && ldr.length > 0) {
      ldr.forEach(e => {
        employees[e.employee_name] = { xp: e.total_xp || 0, department: e.department_name || '' };
      });
    }
  } catch (err) {
    showToast('Failed to load gamification data: ' + err.message, 'error');
  }

  container.innerHTML = `
    <div class="view-container">
      
      <div class="breadcrumb">
        <a href="#dashboard">Dashboard</a>
        <span class="breadcrumb-sep">›</span>
        <a href="#gamification/challenges">Gamification</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">${getGamificationTitle(pageKey)}</span>
      </div>

      <!-- Gamification Header Row with Interactive Switcher -->
      <div class="gamification-header-row">
        <div class="view-header">
          <h1 class="view-title">${getGamificationTitle(pageKey)}</h1>
          <p class="view-description">${getGamificationDesc(pageKey)}</p>
        </div>
        
        <!-- Active User Widget -->
        <div class="simulated-user-widget">
          <div class="active-user-avatar">${getInitials(currentUser)}</div>
          <div class="active-user-details">
            <div class="active-user-name">${currentUser}</div>
            <div class="active-user-meta">
              <span class="active-user-dept">${employees[currentUser]?.department || 'Staff'}</span>
              <span class="active-user-points"><i data-lucide="zap"></i> ${employees[currentUser]?.xp || 0} XP</span>
            </div>
          </div>
          <div class="active-user-switcher">
            <select id="employee-switcher" class="gamify-select">
              ${Object.keys(employees).map(name => `
                <option value="${name}" ${currentUser === name ? 'selected' : ''}>Switch to: ${name}</option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Sub Navigation Tabs -->
      <div class="sub-nav-tabs gamification">
        <a href="#gamification/challenges" class="sub-nav-tab ${pageKey === 'challenges' ? 'active' : ''}"><i data-lucide="flag"></i> Challenges</a>
        <a href="#gamification/challenge-participation" class="sub-nav-tab ${pageKey === 'challenge-participation' ? 'active' : ''}"><i data-lucide="list"></i> Challenge Participation</a>
        <a href="#gamification/badges" class="sub-nav-tab ${pageKey === 'badges' ? 'active' : ''}"><i data-lucide="medal"></i> Badges</a>
        <a href="#gamification/rewards" class="sub-nav-tab ${pageKey === 'rewards' ? 'active' : ''}"><i data-lucide="gift"></i> Rewards</a>
        <a href="#gamification/leaderboard" class="sub-nav-tab ${pageKey === 'leaderboard' ? 'active' : ''}"><i data-lucide="trophy"></i> Leaderboard</a>
      </div>

      <!-- Sub-module Content viewport -->
      <div class="gamification-content-panel">
        ${renderSubModulePanel(pageKey)}
      </div>
    </div>
    
    <!-- Dynamic Modals Container -->
    <div id="gamification-modals">
      ${renderCreateChallengeModal()}
      ${renderSubmitEvidenceModal()}
    </div>
    
    <!-- Toast notifications popup for dynamic events -->
    <div id="gamification-toast-container" class="toast-container"></div>
    
    <style>${getGamificationCSS()}</style>
  `;

  // Bind events
  bindGamificationEvents(container, pageKey);

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
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

function renderSubModulePanel(key) {
  switch (key) {
    case 'challenges':
      return renderChallenges();
    case 'challenge-participation':
      return renderChallengeParticipation();
    case 'badges':
      return renderBadges();
    case 'rewards':
      return renderRewards();
    case 'leaderboard':
      return renderLeaderboard();
    default:
      return `<div class="glass-card">Sub-section not found.</div>`;
  }
}

// ----------------------------------------------------
// 1. Challenges Sub-Module Panel
// ----------------------------------------------------
function renderChallenges() {
  const filter = activeFilterStatus || 'All';
  
  // Filter challenges list
  const filteredChallenges = challenges.filter(c => {
    if (filter === 'All') return true;
    return c.status === filter;
  });

  const cardsHtml = filteredChallenges.map(c => {
    // Get participation record for current employee
    const part = participations.find(p => p.challengeId === c.id && p.employee === currentUser);
    
    let btnHtml = '';
    let statusPillHtml = '';

    // Draw status indicators and action buttons based on state
    if (c.status === 'Draft') {
      statusPillHtml = `<span class="status-pill state-draft">Draft</span>`;
      btnHtml = `
        <div class="card-action-group">
          <button class="btn btn-secondary btn-activate-challenge full-width" data-id="${c.id}"><i data-lucide="play"></i> Activate</button>
        </div>
      `;
    } else if (c.status === 'Archived') {
      statusPillHtml = `<span class="status-pill state-archived">Archived</span>`;
      btnHtml = `<button class="btn btn-secondary full-width" disabled>Archived</button>`;
    } else if (c.status === 'Completed') {
      statusPillHtml = `<span class="status-pill state-completed">Challenge Completed</span>`;
      btnHtml = `<button class="btn btn-secondary full-width" disabled><i data-lucide="check-circle-2"></i> Finished</button>`;
    } else { // Active or Under Review challenge
      if (!part) {
        if (c.status === 'Active') {
          btnHtml = `<button class="btn btn-gamify btn-join-challenge full-width" data-id="${c.id}"><i data-lucide="user-plus"></i> Join Challenge</button>`;
        } else {
          btnHtml = `<button class="btn btn-secondary full-width" disabled>Under Review</button>`;
        }
        statusPillHtml = `<span class="status-pill state-active">Active</span>`;
      } else if (part.status === 'Joined') {
        btnHtml = `<button class="btn btn-warning btn-submit-evidence-trigger full-width" data-id="${c.id}" data-title="${c.title}" data-xp="${c.xp}"><i data-lucide="file-text"></i> Submit Evidence</button>`;
        statusPillHtml = `<span class="status-pill state-joined">Joined</span>`;
      } else if (part.status === 'Pending') {
        btnHtml = `<button class="btn btn-secondary full-width" disabled><i data-lucide="clock"></i> Pending Approval</button>`;
        statusPillHtml = `<span class="status-pill state-under-review">Under Review</span>`;
      } else if (part.status === 'Approved') {
        btnHtml = `<button class="btn btn-success-active full-width" disabled><i data-lucide="check"></i> Completed (+${c.xp} XP)</button>`;
        statusPillHtml = `<span class="status-pill state-approved">Approved</span>`;
      } else if (part.status === 'Rejected') {
        btnHtml = `<button class="btn btn-danger btn-submit-evidence-trigger full-width" data-id="${c.id}" data-title="${c.title}" data-xp="${c.xp}"><i data-lucide="alert-circle"></i> Rejected (Resubmit)</button>`;
        statusPillHtml = `<span class="status-pill state-rejected">Rejected</span>`;
      }
    }

    const diffClass = c.difficulty === 'Easy' ? 'diff-easy' : (c.difficulty === 'Medium' ? 'diff-medium' : 'diff-hard');

    return `
      <div class="glass-card challenge-card">
        <div class="c-card-header">
          <span class="difficulty-tag ${diffClass}">${c.difficulty}</span>
          <span class="points-badge">${c.xp} XP</span>
        </div>
        <h4 class="challenge-title">${c.title}</h4>
        <p class="challenge-desc">${c.description}</p>
        <div class="challenge-meta">
          <span>Category: ${c.category}</span>
          <span>Deadline: ${c.deadline}</span>
        </div>
        <div class="challenge-card-footer">
          <div class="status-indicator">${statusPillHtml}</div>
          ${btnHtml}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="table-actions">
      <!-- Visual Pipeline Status Switcher -->
      <div class="lifecycle-bar">
        <button class="lifecycle-step ${filter === 'All' ? 'active' : ''}" data-status="All">
          <span class="step-label">All Challenges</span>
        </button>
        <div class="step-connector"></div>
        <button class="lifecycle-step ${filter === 'Draft' ? 'active' : ''}" data-status="Draft">
          <span class="step-dot color-draft"></span>
          <span class="step-label">Draft</span>
        </button>
        <div class="step-connector">➔</div>
        <button class="lifecycle-step ${filter === 'Active' ? 'active' : ''}" data-status="Active">
          <span class="step-dot color-active"></span>
          <span class="step-label">Active</span>
        </button>
        <div class="step-connector">➔</div>
        <button class="lifecycle-step ${filter === 'Under Review' ? 'active' : ''}" data-status="Under Review">
          <span class="step-dot color-under-review"></span>
          <span class="step-label">Under Review</span>
        </button>
        <div class="step-connector">➔</div>
        <button class="lifecycle-step ${filter === 'Completed' ? 'active' : ''}" data-status="Completed">
          <span class="step-dot color-completed"></span>
          <span class="step-label">Completed</span>
        </button>
        <div class="step-connector">|</div>
        <button class="lifecycle-step ${filter === 'Archived' ? 'active' : ''}" data-status="Archived">
          <span class="step-dot color-archived"></span>
          <span class="step-label">Archived</span>
        </button>
      </div>
      
      <button class="btn btn-gamify" id="create-challenge-btn"><i data-lucide="plus"></i> New Challenge</button>
    </div>

    <!-- Challenges Grid -->
    <div class="grid-3">
      ${cardsHtml ? cardsHtml : '<div class="glass-card full-width text-center" style="grid-column: span 3; padding: 40px; color: var(--text-secondary);">No challenges found in this status </div>'}
    </div>

    <!-- Two-Column Layout for Badges and Leaderboard -->
    <div class="challenges-dashboard-row">
      <!-- Badge Gallery Column -->
      <div class="dashboard-col col-left">
        <div class="view-card">
          <div class="card-header-with-icon">
            <h3>🏅 Badge Gallery</h3>
            <span class="card-header-subtitle">Auto-awarded achievements</span>
          </div>
          <div class="dashboard-badge-grid">
            ${renderBadgeGalleryList()}
          </div>
        </div>
      </div>

      <!-- Mini Leaderboard Column -->
      <div class="dashboard-col col-right">
        <div class="view-card">
          <div class="card-header-with-icon">
            <h3>🏆 Leaderboard</h3>
            <span class="card-header-subtitle">Individual rankings</span>
          </div>
          <div class="mini-leaderboard-list">
            ${renderMiniLeaderboard()}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderBadgeGalleryList() {
  const currentBadges = employees[currentUser]?.badges || [];
  return badges.map(b => {
    const isUnlocked = currentBadges.includes(b.id);
    return `
      <div class="mini-badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="mini-badge-icon">${b.icon}</div>
        <div class="mini-badge-details">
          <h4>${b.name}</h4>
          <p>${b.description}</p>
          <span class="mini-badge-rule">Rule: ${b.unlockRule}</span>
        </div>
        <div class="mini-badge-status">
          ${isUnlocked ? '<span class="status-text-unlocked"><i data-lucide="sparkles"></i> Unlocked</span>' : '<span class="status-text-locked"><i data-lucide="lock"></i> Locked</span>'}
        </div>
      </div>
    `;
  }).join('');
}

function renderMiniLeaderboard() {
  // Sort employees by XP
  const sorted = Object.keys(employees).map(name => ({
    name,
    xp: employees[name].xp,
    dept: employees[name].department
  })).sort((a, b) => b.xp - a.xp);

  return sorted.slice(0, 3).map((item, idx) => {
    const rankClass = idx === 0 ? 'rank-1' : (idx === 1 ? 'rank-2' : 'rank-3');
    return `
      <div class="mini-leaderboard-item">
        <div class="leaderboard-rank ${rankClass}">${idx + 1}</div>
        <div class="user-avatar-small">${getInitials(item.name)}</div>
        <div class="leaderboard-item-details">
          <strong>${item.name}</strong>
          <span class="dept-text">${item.dept}</span>
        </div>
        <div class="leaderboard-item-xp">${item.xp.toLocaleString()} XP</div>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// 2. Challenge Participation Sub-Module Panel (Admin Queue)
// ----------------------------------------------------
function renderChallengeParticipation() {
  // Compute pending and active counts
  const totalXP = Object.keys(employees).reduce((sum, name) => sum + employees[name].xp, 0);
  const pendingSubmissions = participations.filter(p => p.status === 'Pending');
  const activeParticipations = participations.filter(p => p.status === 'Joined');

  // Generate table rows
  const tableRows = pendingSubmissions.map(p => {
    const challenge = challenges.find(c => c.id === p.challengeId) || { title: 'Unknown Challenge', xp: 0 };
    return `
      <tr data-participation-id="${p.id}">
        <td><strong>${p.employee}</strong></td>
        <td>${challenge.title}</td>
        <td>
          <a href="#" class="proof-link" onclick="event.preventDefault(); alert('Evidence Content: ${p.proof}');">
            <i data-lucide="file"></i> ${p.proof}
          </a>
        </td>
        <td><span class="status-tag status-tag-pending">Under Review</span></td>
        <td><strong>${challenge.xp} XP</strong></td>
        <td>
          <div class="action-buttons-group">
            <button class="action-btn-mini btn-approve btn-approve-submission" data-id="${p.id}" title="Approve Submission"><i data-lucide="check"></i></button>
            <button class="action-btn-mini btn-reject btn-reject-submission" data-id="${p.id}" title="Reject Submission"><i data-lucide="x"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="grid-3">
      <div class="glass-card stat-box border-gamify">
        <span class="stat-lbl">Active Participations</span>
        <h3>${activeParticipations.length}</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Submissions Pending Review</span>
        <h3>${pendingSubmissions.length}</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Total XP Distributed</span>
        <h3>${totalXP.toLocaleString()} XP</h3>
      </div>
    </div>

    <div class="view-card">
      <div class="card-header">
        <h3>Challenge Submissions Approval Queue</h3>
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
            ${tableRows ? tableRows : '<tr><td colspan="6" class="text-center" style="padding: 30px; color: var(--text-secondary);"><i data-lucide="info"></i> No challenge submissions pending review in the queue.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Notifications Log -->
    <div class="view-card" style="margin-top: 24px;">
      <div class="card-header">
        <h3>Recent Gamification Notifications</h3>
      </div>
      <div class="notification-log-list">
        ${notifications.map(n => `
          <div class="notif-log-item notif-type-${n.type || 'info'}">
            <span class="notif-dot"></span>
            <span class="notif-text">${n.text}</span>
            <span class="notif-date">${n.date}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. Badges Sub-Module Panel (Full Gallery)
// ----------------------------------------------------
function renderBadges() {
  const currentBadges = employees[currentUser]?.badges || [];
  
  const badgeCardsHtml = badges.map(b => {
    const isUnlocked = currentBadges.includes(b.id);
    return `
      <div class="glass-card badge-gallery-card ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="badge-icon-large">${b.icon}</div>
        <h4>${b.name}</h4>
        <p>${b.description}</p>
        <span class="badge-rule">Unlock Rule: ${b.unlockRule}</span>
        <span class="badge-status-tag">${isUnlocked ? '<i data-lucide="sparkles"></i> Unlocked' : '<i data-lucide="lock"></i> Locked'}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="badge-summary-header">
      <div class="badge-stats-row">
        <span>Unlocked: <strong>${currentBadges.length} / ${badges.length}</strong> Badges</span>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${(currentBadges.length / badges.length) * 100}%"></div>
        </div>
      </div>
    </div>
    <div class="grid-4">
      ${badgeCardsHtml}
    </div>
  `;
}

// ----------------------------------------------------
// 4. Rewards Sub-Module Panel (Catalog & Redemption)
// ----------------------------------------------------
function renderRewards() {
  const points = employees[currentUser]?.xp || 0;

  const rewardCardsHtml = rewards.map(r => {
    const isOutOfStock = r.stock <= 0;
    const canAfford = points >= r.points;
    const isRedeemable = !isOutOfStock && canAfford;

    return `
      <div class="glass-card reward-store-card">
        <div class="reward-media">${r.icon}</div>
        <div class="reward-body">
          <span class="reward-cost">${r.points} Points</span>
          <h4>${r.name}</h4>
          <p>${r.description}</p>
          <div class="reward-stock-row">
            <span class="stock-count">Stock: ${r.stock > 1000 ? 'Unlimited' : `${r.stock} units`}</span>
            <button class="btn btn-gamify btn-redeem-reward" data-id="${r.id}" ${isRedeemable ? '' : 'disabled'}>
              ${isOutOfStock ? 'Out of Stock' : (canAfford ? 'Redeem Reward' : 'Needs More XP')}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="rewards-balance-header">
      <div class="balance-pill">
        <span class="balance-lbl"><i data-lucide="zap"></i> Your Points Balance</span>
        <span class="balance-amount">${points.toLocaleString()} Points</span>
      </div>
    </div>
    <div class="grid-3">
      ${rewardCardsHtml}
    </div>
    
    <!-- Redemptions List -->
    <div class="view-card" style="margin-top: 24px;">
      <div class="card-header">
        <h3>Redemption History</h3>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Reward Item</th>
              <th>Points Deducted</th>
              <th>Redemption Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${redemptions.map(red => `
              <tr>
                <td><strong>${red.employee}</strong></td>
                <td>${red.rewardName}</td>
                <td><span class="deducted-points">-${red.points} XP</span></td>
                <td>${red.date}</td>
                <td><span class="status-tag status-tag-active">Fulfilled</span></td>
              </tr>
            `).join('')}
            ${redemptions.length === 0 ? '<tr><td colspan="5" class="text-center" style="padding:20px; color:var(--text-secondary);">No redemptions logged yet.</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. Leaderboard Sub-Module Panel (Expanded)
// ----------------------------------------------------
function renderLeaderboard() {
  // Sort individuals
  const sortedIndividuals = Object.keys(employees).map(name => ({
    name,
    xp: employees[name].xp,
    dept: employees[name].department,
    badgesCount: employees[name].badges.length
  })).sort((a, b) => b.xp - a.xp);

  const individualRows = sortedIndividuals.map((emp, index) => {
    const rankClass = index === 0 ? 'rank-1' : (index === 1 ? 'rank-2' : 'rank-3');
    return `
      <div class="list-item">
        <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
        <div class="user-avatar-small">${getInitials(emp.name)}</div>
        <div class="item-info">
          <strong>${emp.name}</strong>
          <span class="item-sub">${emp.dept} &bull; ${emp.badgesCount} Badges</span>
        </div>
        <span class="points-badge">${emp.xp.toLocaleString()} XP</span>
      </div>
    `;
  }).join('');

  // Department average hardcoded layout as per mockup
  const departments = [
    { name: 'Product Design & R&D', env: 86, soc: 82, gov: 94, score: 87.3 },
    { name: 'Finance & Operations', env: 78, soc: 74, gov: 88, score: 80.0 },
    { name: 'Logistics & Supply Chain', env: 64, soc: 72, gov: 91, score: 75.7 }
  ];

  const departmentRows = departments.map((dept, index) => {
    const rankClass = index === 0 ? 'rank-1' : (index === 1 ? 'rank-2' : 'rank-3');
    return `
      <div class="list-item">
        <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
        <div class="item-info">
          <strong>${dept.name}</strong>
          <span class="item-sub">Env: ${dept.env} | Soc: ${dept.soc} | Gov: ${dept.gov}</span>
        </div>
        <span class="points-badge badge-green">${dept.score} / 100</span>
      </div>
    `;
  }).join('');

  return `
    <div class="grid-2">
      <!-- Individual Leaderboard -->
      <div class="view-card">
        <div class="card-header">
          <h3>Individual Leaderboard</h3>
        </div>
        <div class="list-container">
          ${individualRows}
        </div>
      </div>

      <!-- Department Leaderboard -->
      <div class="view-card">
        <div class="card-header">
          <h3>Department ESG Average Scores</h3>
        </div>
        <div class="list-container">
          ${departmentRows}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// Modal Renders
// ----------------------------------------------------
function renderCreateChallengeModal() {
  const categories = [];
  return `
    <div id="create-challenge-modal" class="gamify-modal">
      <div class="gamify-modal-content">
        <div class="gamify-modal-header">
          <h3>Create New Challenge</h3>
          <button class="close-modal-btn" id="close-create-modal">&times;</button>
        </div>
        <form id="create-challenge-form" class="gamify-form">
          <div class="form-group">
            <label for="c-title">Challenge Title</label>
            <input type="text" id="c-title" required placeholder="e.g. Commute Green Week">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="c-category">Category</label>
              <select id="c-category" required>
                ${categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="c-difficulty">Difficulty</label>
              <select id="c-difficulty" required>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="c-xp">XP Reward</label>
              <input type="number" id="c-xp" required min="10" max="1000" value="100">
            </div>
            <div class="form-group">
              <label for="c-deadline">Deadline</label>
              <input type="date" id="c-deadline" required value="2026-07-25">
            </div>
          </div>
          <div class="form-group">
            <label for="c-desc">Description</label>
            <textarea id="c-desc" required rows="3" placeholder="Describe the challenge actions and expectations..."></textarea>
          </div>
          <div class="form-row checkbox-row">
            <label class="checkbox-lbl">
              <input type="checkbox" id="c-evidence" checked>
              Evidence Required (proof upload required)
            </label>
          </div>
          <div class="form-group">
            <label for="c-status">Initial Lifecycle Status</label>
            <select id="c-status">
              <option value="Draft">Draft (Setup mode)</option>
              <option value="Active">Active (Publish immediately)</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="cancel-create-modal">Cancel</button>
            <button type="submit" class="btn btn-gamify">Create Challenge</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderSubmitEvidenceModal() {
  return `
    <div id="submit-evidence-modal" class="gamify-modal">
      <div class="gamify-modal-content">
        <div class="gamify-modal-header">
          <h3>Submit Challenge Evidence</h3>
          <button class="close-modal-btn" id="close-submit-modal">&times;</button>
        </div>
        <form id="submit-evidence-form" class="gamify-form">
          <input type="hidden" id="submit-challenge-id">
          <div class="challenge-submit-info">
            <p>You are submitting evidence for: <strong id="submit-challenge-title">Challenge Title</strong></p>
            <p>XP Reward: <strong id="submit-challenge-xp">100 XP</strong></p>
          </div>
          <div class="form-group">
            <label for="evidence-file">Upload Proof (Simulated file name, e.g. strava_log.png)</label>
            <input type="text" id="evidence-file" required placeholder="e.g. commute_log_strava.png">
          </div>
          <div class="form-group">
            <label for="evidence-notes">Submission Notes / Summary</label>
            <textarea id="evidence-notes" rows="3" placeholder="Summarize your actions..."></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="cancel-submit-modal">Cancel</button>
            <button type="submit" class="btn btn-gamify">Submit for Review</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// Event Bindings
// ----------------------------------------------------
function bindGamificationEvents(container, pageKey) {
  // 1. Simulated Employee Switcher
  const userSwitcher = container.querySelector('#employee-switcher');
  if (userSwitcher) {
    userSwitcher.addEventListener('change', async (e) => {
      currentUser = e.target.value;
      await renderGamificationPage(container, pageKey);
      showToast(`Switched active user to: ${currentUser}`, 'info');
    });
  }

  // 2. Lifecycle Status Steps
  const steps = container.querySelectorAll('.lifecycle-step');
  steps.forEach(step => {
    step.addEventListener('click', async () => {
      activeFilterStatus = step.getAttribute('data-status');
      await renderGamificationPage(container, pageKey);
    });
  });

  // 3. Open Create Challenge Modal
  const createBtn = container.querySelector('#create-challenge-btn');
  const createModal = container.querySelector('#create-challenge-modal');
  if (createBtn && createModal) {
    createBtn.addEventListener('click', () => {
      createModal.classList.add('open');
    });
  }

  // Close Create Challenge Modal
  const closeCreate = container.querySelector('#close-create-modal');
  const cancelCreate = container.querySelector('#cancel-create-modal');
  if (createModal) {
    const closeModal = () => createModal.classList.remove('open');
    if (closeCreate) closeCreate.addEventListener('click', closeModal);
    if (cancelCreate) cancelCreate.addEventListener('click', closeModal);
  }

  // Submit Create Challenge Form
  const createForm = container.querySelector('#create-challenge-form');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = container.querySelector('#c-title').value.trim();
      const category = container.querySelector('#c-category').value;
      const difficulty = container.querySelector('#c-difficulty').value;
      const xpRaw = container.querySelector('#c-xp').value;
      const xp = parseInt(xpRaw, 10);
      const deadline = container.querySelector('#c-deadline').value;
      const description = container.querySelector('#c-desc').value.trim();
      const evidenceRequired = container.querySelector('#c-evidence').checked;
      const status = container.querySelector('#c-status').value;

      if (!title || title.length < 1 || title.length > 200) {
        showToast('Challenge title must be between 1 and 200 characters.', 'warning');
        return;
      }
      if (!description || description.length < 1 || description.length > 2000) {
        showToast('Challenge description must be between 1 and 2000 characters.', 'warning');
        return;
      }
      if (!xpRaw || isNaN(xp) || xp < 0 || xp > 10000) {
        showToast('XP must be between 0 and 10000.', 'warning');
        return;
      }
      if (!deadline) {
        showToast('Please select a deadline.', 'warning');
        return;
      }
      if (!category) {
        showToast('Please select a category.', 'warning');
        return;
      }

      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      if (!validDifficulties.includes(difficulty)) {
        showToast('Difficulty must be Easy, Medium, or Hard.', 'warning');
        return;
      }

      const validStatuses = ['Draft', 'Active', 'Under Review', 'Completed', 'Archived'];
      if (!validStatuses.includes(status)) {
        showToast('Invalid challenge status.', 'warning');
        return;
      }

      try {
        await api.createChallenge({
          title,
          category_id: 1,
          description,
          xp,
          difficulty,
          evidence_required: evidenceRequired,
          deadline,
          status
        });
        challenges = await api.getChallenges();
      } catch (err) {
        showToast('Failed to create challenge: ' + err.message, 'error');
        return;
      }

      createModal.classList.remove('open');
      await renderGamificationPage(container, pageKey);
      showToast(`Challenge "${title}" created successfully!`);
    });
  }

  // 4. Activate a Challenge
  const activateBtns = container.querySelectorAll('.btn-activate-challenge');
  activateBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      try {
        await api.updateChallengeStatus(id, 'Active');
        challenges = await api.getChallenges();
      } catch (err) {
        showToast('Failed to activate challenge: ' + err.message, 'error');
        return;
      }
      await renderGamificationPage(container, pageKey);
      showToast(`Challenge activated!`);
    });
  });

  // 5. Join Challenge Button
  const joinBtns = container.querySelectorAll('.btn-join-challenge');
  joinBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const challenge = challenges.find(c => c.id === id);
      if (!challenge) return;

      const user = getStoredUser();
      const employeeId = user ? user.id : 1;

      try {
        await api.participateInChallenge(id, employeeId);
      } catch (err) {
        showToast('Failed to join challenge: ' + err.message, 'error');
        return;
      }

      const newPart = {
        id: 'p_' + Date.now(),
        challengeId: id,
        employee: currentUser,
        status: challenge.evidenceRequired ? 'Joined' : 'Approved',
        proof: '',
        xpAwarded: challenge.evidenceRequired ? 0 : challenge.xp
      };

      participations.push(newPart);

      if (!challenge.evidenceRequired) {
        employees[currentUser] = employees[currentUser] || { xp: 0, department: '' };
        employees[currentUser].xp += challenge.xp;
        notifications.unshift({
          id: 'notif_' + Date.now(),
          text: `✅ ${currentUser} completed "${challenge.title}" (+${challenge.xp} XP)`,
          date: new Date().toISOString().split('T')[0],
          type: 'success'
        });
        const awards = checkAndAwardBadges(currentUser);
        await renderGamificationPage(container, pageKey);
        if (awards.length > 0) {
          showToast(`Completed! Awarded ${challenge.xp} XP & unlocked ${awards.join(', ')}!`);
        } else {
          showToast(`Completed! Awarded ${challenge.xp} XP!`);
        }
      } else {
        notifications.unshift({
          id: 'notif_' + Date.now(),
          text: `👤 ${currentUser} joined challenge "${challenge.title}"`,
          date: new Date().toISOString().split('T')[0],
          type: 'info'
        });
        checkAndAwardBadges(currentUser);
        await renderGamificationPage(container, pageKey);
        showToast(`Successfully joined "${challenge.title}"!`);
      }
    });
  });

  // 6. Submit Evidence Modal Trigger
  const submitTriggerBtns = container.querySelectorAll('.btn-submit-evidence-trigger');
  const submitModal = container.querySelector('#submit-evidence-modal');
  submitTriggerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const xp = btn.getAttribute('data-xp');

      container.querySelector('#submit-challenge-id').value = id;
      container.querySelector('#submit-challenge-title').textContent = title;
      container.querySelector('#submit-challenge-xp').textContent = xp + ' XP';
      submitModal.classList.add('open');
    });
  });

  // Close Submit Evidence Modal
  const closeSubmit = container.querySelector('#close-submit-modal');
  const cancelSubmit = container.querySelector('#cancel-submit-modal');
  if (submitModal) {
    const closeModal = () => submitModal.classList.remove('open');
    if (closeSubmit) closeSubmit.addEventListener('click', closeModal);
    if (cancelSubmit) cancelSubmit.addEventListener('click', closeModal);
  }

  // Submit Evidence Form
  const submitForm = container.querySelector('#submit-evidence-form');
  if (submitForm) {
    submitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const challengeId = container.querySelector('#submit-challenge-id').value;
      const proofFile = container.querySelector('#evidence-file').value.trim();

      if (!proofFile) {
        showToast('Please provide evidence (URL or file reference).', 'warning');
        return;
      }
      if (proofFile.length > 500) {
        showToast('Evidence URL is too long (max 500 characters).', 'warning');
        return;
      }

      const user = getStoredUser();
      const employeeId = user ? user.id : 1;

      try {
        await api.submitEvidence(challengeId, employeeId, proofFile);
      } catch (err) {
        showToast('Failed to submit evidence: ' + err.message, 'error');
        return;
      }

      const part = participations.find(p => p.challengeId === challengeId && p.employee === currentUser);
      if (part) {
        part.status = 'Pending';
        part.proof = proofFile;
      }

      notifications.unshift({
        id: 'notif_' + Date.now(),
        text: `📄 ${currentUser} submitted proof for "${container.querySelector('#submit-challenge-title').textContent}"`,
        date: new Date().toISOString().split('T')[0],
        type: 'info'
      });

      submitModal.classList.remove('open');
      await renderGamificationPage(container, pageKey);
      showToast('Evidence submitted for review!');
    });
  }

  // 7. Approve / Reject Submissions in Queue (Admin side)
  const approveBtns = container.querySelectorAll('.btn-approve-submission');
  approveBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const partId = btn.getAttribute('data-id');
      const part = participations.find(p => p.id === partId);
      if (!part) return;

      const challenge = challenges.find(c => c.id === part.challengeId);
      if (!challenge) return;

      const user = getStoredUser();
      const employeeId = user ? user.id : 1;

      try {
        await api.approveParticipation(partId, employeeId);
      } catch (err) {
        showToast('Failed to approve submission: ' + err.message, 'error');
        return;
      }

      part.status = 'Approved';
      part.xpAwarded = challenge.xp;

      if (employees[part.employee]) {
        employees[part.employee].xp += challenge.xp;
      }

      notifications.unshift({
        id: 'notif_' + Date.now(),
        text: `✅ Admin approved ${part.employee}'s submission for "${challenge.title}" (+${challenge.xp} XP)`,
        date: new Date().toISOString().split('T')[0],
        type: 'success'
      });

      const awards = checkAndAwardBadges(part.employee);
      await renderGamificationPage(container, pageKey);

      if (awards.length > 0) {
        showToast(`Approved! ${part.employee} earned ${challenge.xp} XP & unlocked ${awards.join(', ')}!`);
      } else {
        showToast(`Submission approved and ${challenge.xp} XP awarded!`);
      }
    });
  });

  const rejectBtns = container.querySelectorAll('.btn-reject-submission');
  rejectBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const partId = btn.getAttribute('data-id');
      const part = participations.find(p => p.id === partId);
      if (!part) return;

      const challenge = challenges.find(c => c.id === part.challengeId);
      part.status = 'Rejected';

      notifications.unshift({
        id: 'notif_' + Date.now(),
        text: `❌ Admin rejected ${part.employee}'s submission for "${challenge ? challenge.title : 'Challenge'}"`,
        date: new Date().toISOString().split('T')[0],
        type: 'warning'
      });

      await renderGamificationPage(container, pageKey);
      showToast('Submission rejected. Employee can resubmit.', 'warning');
    });
  });

  // 8. Redeem Reward Button
  const redeemBtns = container.querySelectorAll('.btn-redeem-reward');
  redeemBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const rewardId = btn.getAttribute('data-id');
      const reward = rewards.find(r => r.id === rewardId);
      const points = employees[currentUser]?.xp || 0;

      if (!reward) return;

      if (reward.stock <= 0) {
        showToast('Item is out of stock!', 'warning');
        return;
      }
      if (points < reward.points) {
        showToast('Insufficient points balance!', 'warning');
        return;
      }

      const user = getStoredUser();
      const employeeId = user ? user.id : 1;

      try {
        await api.redeemReward(rewardId, employeeId);
      } catch (err) {
        showToast('Failed to redeem reward: ' + err.message, 'error');
        return;
      }

      employees[currentUser].xp -= reward.points;
      if (reward.stock < 9999) {
        reward.stock -= 1;
      }

      redemptions.unshift({
        id: 'red_' + Date.now(),
        employee: currentUser,
        rewardName: reward.name,
        points: reward.points,
        date: new Date().toISOString().split('T')[0]
      });

      notifications.unshift({
        id: 'notif_' + Date.now(),
        text: `🛍️ ${currentUser} redeemed "${reward.name}" (-${reward.points} Points)`,
        date: new Date().toISOString().split('T')[0],
        type: 'info'
      });

      await renderGamificationPage(container, pageKey);
      showToast(`Redeemed "${reward.name}" successfully! -${reward.points} Points`);
    });
  });
}

// ----------------------------------------------------
// Local CSS Stylesheet Rules (Glassmorphism & High-end dark theme)
// ----------------------------------------------------
function getGamificationCSS() {
  return `
    /* Layout Header Widget */
    .gamification-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 20px;
    }
    
    @media (max-width: 900px) {
      .gamification-header-row {
        flex-direction: column;
        align-items: flex-start;
      }
      .simulated-user-widget {
        width: 100%;
      }
    }

    /* Active User Widget */
    .simulated-user-widget {
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(21, 26, 38, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-lg);
      padding: 12px 18px;
      min-width: 320px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      position: relative;
    }
    
    .active-user-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-gamification), #d97706);
      color: var(--bg-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 15px;
      border: 2px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
    }
    
    .active-user-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .active-user-name {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .active-user-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 11.5px;
    }
    
    .active-user-dept {
      color: var(--text-secondary);
      max-width: 100px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .active-user-points {
      color: var(--accent-gamification);
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
    
    .active-user-points i {
      width: 11px;
      height: 11px;
    }
    
    .active-user-switcher {
      border-left: 1px solid var(--border-color);
      padding-left: 12px;
      margin-left: 4px;
    }
    
    .gamify-select {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: 11px;
      font-weight: 600;
      padding: 6px 10px;
      outline: none;
      cursor: pointer;
      max-width: 130px;
    }
    
    .gamify-select:focus {
      border-color: var(--accent-gamification);
    }

    /* Actions and Table */
    .table-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
      margin-top: 8px;
    }
    
    @media (max-width: 768px) {
      .table-actions {
        flex-direction: column;
        align-items: flex-start;
      }
      .table-actions button {
        width: 100%;
        justify-content: center;
      }
    }

    /* Lifecycle pipeline bar */
    .lifecycle-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: rgba(21, 26, 38, 0.4);
      padding: 8px 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      overflow-x: auto;
      max-width: 100%;
    }
    
    .lifecycle-step {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: none;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-family: var(--font-heading);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    
    .lifecycle-step:hover {
      color: var(--text-primary);
      background-color: rgba(255,255,255,0.03);
    }
    
    .lifecycle-step.active {
      color: white;
      border-color: rgba(255,255,255,0.1);
      background-color: rgba(255,255,255,0.05);
    }
    
    .lifecycle-step.active[data-status="Active"] {
      border-color: rgba(16, 185, 129, 0.3);
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--accent-success);
    }
    
    .lifecycle-step.active[data-status="Under Review"] {
      border-color: rgba(139, 92, 246, 0.3);
      background-color: rgba(139, 92, 246, 0.1);
      color: var(--accent-warning);
    }
    
    .lifecycle-step.active[data-status="Completed"] {
      border-color: rgba(59, 130, 246, 0.3);
      background-color: rgba(59, 130, 246, 0.1);
      color: var(--accent-info);
    }
    
    .lifecycle-step.active[data-status="Draft"] {
      border-color: rgba(255, 255, 255, 0.2);
      background-color: rgba(255,255,255,0.08);
      color: var(--text-primary);
    }

    .step-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    
    .color-draft { background-color: var(--text-secondary); }
    .color-active { background-color: var(--accent-success); }
    .color-under-review { background-color: var(--accent-warning); }
    .color-completed { background-color: var(--accent-info); }
    .color-archived { background-color: var(--text-muted); }

    .step-connector {
      color: var(--text-muted);
      font-size: 11px;
      padding: 0 2px;
      user-select: none;
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
      transition: background-color var(--transition-fast), transform var(--transition-fast);
      color: white;
    }
    
    .btn:hover {
      transform: translateY(-1px);
    }
    
    .btn:active {
      transform: translateY(0);
    }
    
    .btn-gamify {
      background-color: var(--accent-gamification);
      color: var(--bg-primary);
    }
    
    .btn-gamify:hover {
      background-color: #d97706;
    }
    
    .btn-warning {
      background-color: rgba(245, 158, 11, 0.15);
      color: var(--accent-gamification);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .btn-warning:hover {
      background-color: rgba(245, 158, 11, 0.25);
    }
    
    .btn-secondary {
      background-color: rgba(255,255,255,0.05);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    
    .btn-secondary:hover {
      background-color: rgba(255,255,255,0.1);
    }
    
    .btn-success-active {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--accent-success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    
    .btn-danger {
      background-color: rgba(239, 68, 68, 0.15);
      color: var(--accent-danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .btn-danger:hover {
      background-color: rgba(239, 68, 68, 0.25);
    }

    .full-width {
      width: 100%;
      justify-content: center;
    }
    
    .text-center { text-align: center; }

    /* Challenge card */
    .challenge-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: rgba(21, 26, 38, 0.4);
      border: 1px solid var(--border-color);
    }
    
    .c-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .difficulty-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .diff-easy { background-color: rgba(16, 185, 129, 0.15); color: var(--accent-success); border: 1px solid rgba(16, 185, 129, 0.2); }
    .diff-medium { background-color: rgba(59, 130, 246, 0.15); color: var(--accent-info); border: 1px solid rgba(59, 130, 246, 0.2); }
    .diff-hard { background-color: rgba(239, 68, 68, 0.15); color: var(--accent-danger); border: 1px solid rgba(239, 68, 68, 0.2); }
    .diff-gamify { background-color: rgba(245, 158, 11, 0.15); color: var(--accent-gamification); border: 1px solid rgba(245, 158, 11, 0.2); }

    .points-badge {
      background-color: rgba(245, 158, 11, 0.12);
      color: var(--accent-gamification);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 700;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    
    .badge-green {
      background-color: rgba(16, 185, 129, 0.12);
      color: var(--accent-success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    
    .challenge-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .challenge-desc {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
      flex-grow: 1;
    }
    
    .challenge-meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 11.5px;
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
      padding-top: 12px;
    }
    
    .challenge-card-footer {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: auto;
    }

    .status-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      display: inline-block;
    }
    .state-draft { background-color: rgba(255, 255, 255, 0.05); color: var(--text-secondary); }
    .state-active { background-color: rgba(16, 185, 129, 0.1); color: var(--accent-success); }
    .state-joined { background-color: rgba(59, 130, 246, 0.1); color: var(--accent-info); }
    .state-under-review { background-color: rgba(139, 92, 246, 0.1); color: var(--accent-warning); }
    .state-approved { background-color: rgba(16, 185, 129, 0.15); color: var(--accent-success); }
    .state-rejected { background-color: rgba(239, 68, 68, 0.15); color: var(--accent-danger); }
    .state-completed { background-color: rgba(59, 130, 246, 0.1); color: var(--accent-info); }
    .state-archived { background-color: rgba(0, 0, 0, 0.2); color: var(--text-muted); }

    /* Dashboard Two-Column Row */
    .challenges-dashboard-row {
      display: grid;
      grid-template-columns: 1.3fr 0.9fr;
      gap: 20px;
      margin-top: 32px;
    }
    
    @media (max-width: 950px) {
      .challenges-dashboard-row {
        grid-template-columns: 1fr;
      }
    }

    .card-header-with-icon {
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .card-header-with-icon h3 {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .card-header-subtitle {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Dashboard Badges List */
    .dashboard-badge-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 6px;
    }
    
    .dashboard-badge-grid::-webkit-scrollbar {
      width: 4px;
    }
    .dashboard-badge-grid::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-full);
    }

    .mini-badge-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      background-color: rgba(255, 255, 255, 0.01);
      transition: all var(--transition-fast);
    }
    
    .mini-badge-card.unlocked {
      background-color: rgba(16, 185, 129, 0.02);
      border-color: rgba(16, 185, 129, 0.15);
    }
    
    .mini-badge-card.locked {
      opacity: 0.55;
    }
    
    .mini-badge-icon {
      font-size: 28px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0,0,0,0.2);
      border-radius: var(--radius-sm);
    }
    
    .mini-badge-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .mini-badge-details h4 {
      font-family: var(--font-heading);
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .mini-badge-details p {
      font-size: 11.5px;
      color: var(--text-secondary);
      line-height: 1.3;
    }
    
    .mini-badge-rule {
      font-size: 10px;
      color: var(--text-muted);
      font-style: italic;
    }
    
    .mini-badge-status {
      font-size: 11px;
      font-weight: 700;
    }
    
    .status-text-unlocked { color: var(--accent-success); display: inline-flex; align-items: center; gap: 4px; }
    .status-text-unlocked i { width: 12px; height: 12px; }
    .status-text-locked { color: var(--text-muted); display: inline-flex; align-items: center; gap: 4px; }
    .status-text-locked i { width: 12px; height: 12px; }

    /* Mini Leaderboard List */
    .mini-leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .mini-leaderboard-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background-color: rgba(255,255,255,0.01);
    }
    
    .leaderboard-rank {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 11.5px;
      font-family: var(--font-heading);
    }
    
    .rank-1 { background-color: rgba(245, 158, 11, 0.15); color: var(--accent-gamification); border: 1px solid rgba(245, 158, 11, 0.3); }
    .rank-2 { background-color: rgba(156, 163, 175, 0.15); color: var(--text-secondary); border: 1px solid rgba(156, 163, 175, 0.3); }
    .rank-3 { background-color: rgba(217, 119, 6, 0.15); color: #d97706; border: 1px solid rgba(217, 119, 6, 0.3); }

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
      color: var(--text-primary);
    }
    
    .leaderboard-item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    
    .leaderboard-item-details strong {
      font-size: 13px;
      color: var(--text-primary);
    }
    
    .dept-text {
      font-size: 10.5px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 140px;
    }
    
    .leaderboard-item-xp {
      font-size: 12px;
      font-weight: 700;
      color: var(--accent-gamification);
    }

    /* Stat Box border info */
    .stat-box {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: rgba(21, 26, 38, 0.5);
    }
    
    .stat-lbl {
      font-size: 12px;
      color: var(--text-secondary);
    }
    
    .stat-box h3 {
      font-family: var(--font-heading);
      font-size: 26px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .border-gamify {
      border-color: rgba(245, 158, 11, 0.25);
    }

    /* Submissions review table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .data-table th, .data-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color);
      font-size: 13.5px;
      text-align: left;
    }
    
    .data-table th {
      color: var(--text-muted);
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
      gap: 8px;
    }
    
    .action-btn-mini {
      width: 30px;
      height: 30px;
      border-radius: var(--radius-sm);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
      transition: background-color var(--transition-fast);
    }
    
    .action-btn-mini i {
      width: 15px;
      height: 15px;
    }
    
    .btn-approve {
      background-color: var(--accent-success);
    }
    .btn-approve:hover { background-color: #059669; }
    
    .btn-reject {
      background-color: var(--accent-danger);
    }
    .btn-reject:hover { background-color: #dc2626; }
    
    .deducted-points {
      color: var(--accent-danger);
      font-weight: 700;
    }

    /* Notification log list */
    .notification-log-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-height: 250px;
      overflow-y: auto;
    }
    
    .notif-log-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background-color: rgba(255,255,255,0.01);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      font-size: 13px;
    }
    
    .notif-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    
    .notif-type-success .notif-dot { background-color: var(--accent-success); }
    .notif-type-info .notif-dot { background-color: var(--accent-gamification); }
    .notif-type-warning .notif-dot { background-color: var(--accent-danger); }
    .notif-type-badge .notif-dot { background-color: var(--accent-warning); }

    .notif-text {
      flex: 1;
      color: var(--text-primary);
    }
    
    .notif-date {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Badge Summary Header */
    .badge-summary-header {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 20px 24px;
      margin-bottom: 24px;
    }
    
    .badge-stats-row {
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    
    .progress-bar-container {
      flex: 1;
      height: 8px;
      background-color: rgba(255,255,255,0.05);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-gamification), var(--accent-success));
      border-radius: var(--radius-full);
      transition: width 0.4s ease-out;
    }

    /* Full Badge Card */
    .badge-gallery-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      background-color: rgba(21, 26, 38, 0.4);
    }
    
    .badge-gallery-card.locked {
      opacity: 0.45;
    }
    
    .badge-gallery-card.locked .badge-icon-large {
      filter: grayscale(100%) blur(0.5px);
    }
    
    .badge-icon-large {
      font-size: 48px;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0,0,0,0.25);
      border-radius: 50%;
      border: 1px solid var(--border-color);
    }
    
    .badge-gallery-card h4 {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
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
      background-color: rgba(0,0,0,0.2);
      padding: 3px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
    }
    
    .badge-status-tag {
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    
    .unlocked .badge-status-tag { color: var(--accent-success); }
    .locked .badge-status-tag { color: var(--text-muted); }
    .badge-status-tag i { width: 12px; height: 12px; }

    /* Rewards Balance header */
    .rewards-balance-header {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 16px 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: flex-start;
    }
    
    .balance-pill {
      display: inline-flex;
      align-items: center;
      gap: 14px;
      background-color: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: var(--radius-md);
      padding: 10px 16px;
    }
    
    .balance-lbl {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .balance-lbl i { width: 14px; height: 14px; color: var(--accent-gamification); }
    
    .balance-amount {
      font-size: 18px;
      font-weight: 800;
      color: var(--accent-gamification);
      font-family: var(--font-heading);
    }

    /* Reward card */
    .reward-store-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
      background: rgba(21, 26, 38, 0.4);
      border: 1px solid var(--border-color);
    }
    
    .reward-media {
      height: 150px;
      background-color: rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 64px;
      border-bottom: 1px solid var(--border-color);
      user-select: none;
    }
    
    .reward-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      flex-grow: 1;
    }
    
    .reward-cost {
      background-color: rgba(245, 158, 11, 0.12);
      color: var(--accent-gamification);
      font-size: 11px;
      font-weight: 700;
      align-self: flex-start;
      padding: 3px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    
    .reward-body h4 {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .reward-body p {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.45;
      flex-grow: 1;
    }
    
    .reward-stock-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px solid var(--border-color);
      padding-top: 14px;
      margin-top: auto;
    }
    
    .stock-count {
      font-size: 12.5px;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Leaderboard CSS List details */
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .list-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.01);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      transition: border-color var(--transition-fast);
    }
    
    .list-item:hover {
      border-color: var(--border-hover);
    }
    
    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    
    .item-info strong {
      font-size: 14.5px;
      color: var(--text-primary);
    }
    
    .item-sub {
      font-size: 11.5px;
      color: var(--text-secondary);
    }

    /* Premium Custom CSS Modals */
    .gamify-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(5, 7, 12, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    
    .gamify-modal.open {
      opacity: 1;
      pointer-events: auto;
    }
    
    .gamify-modal-content {
      background-color: var(--bg-card);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 500px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      transform: scale(0.95);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .gamify-modal.open .gamify-modal-content {
      transform: scale(1);
    }
    
    .gamify-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 12px;
    }
    
    .gamify-modal-header h3 {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .close-modal-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: var(--text-secondary);
      cursor: pointer;
      line-height: 1;
    }
    .close-modal-btn:hover { color: var(--text-primary); }
    
    .gamify-form {
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
      font-size: 11.5px;
      color: var(--text-secondary);
      font-weight: 600;
    }
    
    .gamify-form input[type="text"],
    .gamify-form input[type="number"],
    .gamify-form input[type="date"],
    .gamify-form select,
    .gamify-form textarea {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      color: var(--text-primary);
      font-size: 13.5px;
      outline: none;
      font-family: var(--font-body);
      width: 100%;
    }
    
    .gamify-form input:focus,
    .gamify-form select:focus,
    .gamify-form textarea:focus {
      border-color: var(--accent-gamification);
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .checkbox-row {
      display: flex;
      align-items: center;
      padding: 4px 0;
    }
    
    .checkbox-lbl {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      color: var(--text-secondary);
      cursor: pointer;
      user-select: none;
    }
    .checkbox-lbl input {
      width: 16px;
      height: 16px;
      accent-color: var(--accent-gamification);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 10px;
    }
    
    .challenge-submit-info {
      background-color: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 12px;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* Elegant CSS Toast Notifications */
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 1050;
      pointer-events: none;
    }
    
    .toast {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 12px 18px;
      min-width: 280px;
      max-width: 400px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      box-shadow: var(--shadow-lg);
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto;
    }
    
    .toast.visible {
      transform: translateX(0);
      opacity: 1;
    }
    
    .toast-message {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-primary);
      line-height: 1.4;
    }
    
    .toast-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
    }
    .toast-close:hover { color: var(--text-primary); }
    
    .toast-success { border-left: 4px solid var(--accent-success); }
    .toast-warning { border-left: 4px solid var(--accent-danger); }
    .toast-info { border-left: 4px solid var(--accent-gamification); }
  `;
}
