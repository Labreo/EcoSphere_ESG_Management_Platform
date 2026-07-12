/**
 * EcoSphere Social Module View Component - Unified, Interactive & Top-Nav Layout
 */

import * as api from '../api/social.js';
import { showToast, renderLoading } from '../api/toast.js';

const MOCK_ACTIVITIES = [
  { id: '1', emoji: '🌳', title: 'Tree Plantation Drive', description: 'Plant trees in the local community park', joinedCount: 24, requirement: 'Open', xp: 50, joined: false, category_id: 1, date: '2026-08-15', max_participants: 100, status: 'Upcoming' },
  { id: '2', emoji: '🩸', title: 'Blood Donation Camp', description: 'Annual blood donation drive with Red Cross', joinedCount: 18, requirement: 'Open', xp: 50, joined: false, category_id: 2, date: '2026-09-10', max_participants: 50, status: 'Upcoming' },
  { id: '3', emoji: '🏖️', title: 'Beach Cleanup', description: 'Clean up the coastal shoreline area', joinedCount: 35, requirement: 'Open', xp: 50, joined: false, category_id: 1, date: '2026-08-22', max_participants: 80, status: 'Upcoming' },
  { id: '4', emoji: '📚', title: 'ESG Workshop', description: 'Educational workshop on ESG principles', joinedCount: 42, requirement: 'Evidence Required', xp: 30, joined: false, category_id: 3, date: '2026-09-05', max_participants: 200, status: 'Upcoming' },
  { id: '5', emoji: '🏥', title: 'Health & Wellness Camp', description: 'Free health checkup for underprivileged communities', joinedCount: 12, requirement: 'Open', xp: 40, joined: false, category_id: 2, date: '2026-09-20', max_participants: 60, status: 'Upcoming' },
  { id: '6', emoji: '🌟', title: 'Food Bank Drive', description: 'Collect and distribute food to local shelters', joinedCount: 8, requirement: 'Evidence Required', xp: 35, joined: false, category_id: 2, date: '2026-10-05', max_participants: 40, status: 'Upcoming' },
];
const MOCK_QUEUE = [
  { id: 'q1', employee: 'Aditi Rao', activity: 'Tree Plantation Drive', proof: 'proof_selfie.png', points: 50, status: 'Approved' },
  { id: 'q2', employee: 'Karan Shah', activity: 'Tree Plantation Drive', proof: 'karan_plantation.jpg', points: 50, status: 'Approved' },
  { id: 'q3', employee: 'Sarah Jenkins', activity: 'Tree Plantation Drive', proof: 'sarah_tree.jpg', points: 0, status: 'Pending' },
  { id: 'q4', employee: 'Mark Robinson', activity: 'Blood Donation Camp', proof: 'donation_cert.pdf', points: 50, status: 'Approved' },
  { id: 'q5', employee: 'Aditi Rao', activity: 'Blood Donation Camp', proof: '', points: 0, status: 'Pending' },
  { id: 'q6', employee: 'Karan Shah', activity: 'Beach Cleanup', proof: 'beach_before_after.jpg', points: 0, status: 'Pending' },
];

let activities = [];
let approvalQueue = [];
let trainings = [];
let trainingLog = [];
let selectedQueueId = null;
let selectedParticipationId = null;

/**
 * Main render function entry point
 */
export async function renderSocialPage(container, pageKey) {
  if (!pageKey) pageKey = 'csr-activities';
  renderLoading(container);
  try {
    const data = await api.getActivities();
    activities = data;
    approvalQueue = [];
  } catch (err) {
    activities = MOCK_ACTIVITIES;
    approvalQueue = MOCK_QUEUE;
  }

  const socialPageTitles = { 'csr-activities': 'CSR Activities', 'employee-participation': 'Employee Participation', 'diversity-dashboard': 'Diversity Dashboard', 'training-completion': 'Training Completion' };

  container.innerHTML = `
    <div class="view-container">
      
      <div class="breadcrumb">
        <a href="#dashboard">Dashboard</a>
        <span class="breadcrumb-sep">›</span>
        <a href="#social/csr-activities">Social</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">${socialPageTitles[pageKey] || 'Social'}</span>
      </div>

      <!-- Sub Navigation Tabs -->
      <div class="sub-nav-tabs social">
        <a href="#social/csr-activities" class="sub-nav-tab ${pageKey === 'csr-activities' ? 'active' : ''}">
          <i data-lucide="heart"></i> CSR Activities
        </a>
        <a href="#social/employee-participation" class="sub-nav-tab ${pageKey === 'employee-participation' ? 'active' : ''}">
          <i data-lucide="user-check"></i> Employee Participation
        </a>
        <a href="#social/diversity-dashboard" class="sub-nav-tab ${pageKey === 'diversity-dashboard' ? 'active' : ''}">
          <i data-lucide="equal"></i> Diversity Dashboard
        </a>
        <a href="#social/training-completion" class="sub-nav-tab ${pageKey === 'training-completion' ? 'active' : ''}">
          <i data-lucide="book-open"></i> Training Completion
        </a>
      </div>

      <!-- Active Section Panel -->
      <div id="social-section-panel">
        ${renderActiveSectionPanel(pageKey)}
      </div>
    </div>

    <style>${getSocialCSS()}</style>
  `;

  // Bind events for the currently active tab
  bindActivePanelEvents(container, pageKey);

  // Load Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // For diversity dashboard, fetch metrics from API
  if (pageKey === 'diversity-dashboard') {
    try {
      const metrics = await api.getDiversityMetrics();
      const panel = container.querySelector('#social-section-panel');
      if (panel) {
        panel.innerHTML = renderDiversityDashboard(metrics);
        if (window.lucide) window.lucide.createIcons();
      }
    } catch (err) {
      showToast('Failed to load diversity metrics: ' + err.message, 'error');
    }
  }

  // For training completion, fetch data from API
  if (pageKey === 'training-completion') {
    try {
      const [courses, myTraining] = await Promise.all([
        api.getTrainingCourses(),
        api.getMyTraining(),
      ]);
      trainings = courses.map(c => {
        const my = myTraining.find(t => t.course_id === c.id);
        let status = 'Not Started';
        if (my) {
          status = my.completed_at ? 'Completed' : 'In Progress';
        }
        return {
          id: String(c.id),
          title: c.title,
          category: c.category,
          completionRate: my ? Math.round(my.progress) : 0,
          xp: c.xp,
          status: status,
        };
      });
      trainingLog = myTraining.map(t => ({
        id: String(t.id),
        employee: 'Me',
        course: t.course_title,
        progress: Math.round(t.progress),
        completedDate: t.completed_at || '-',
        xp: t.xp_awarded || 0,
      }));
      const panel = container.querySelector('#social-section-panel');
      if (panel) {
        panel.innerHTML = renderTrainingCompletion();
        bindTrainingEvents(container);
        if (window.lucide) window.lucide.createIcons();
      }
    } catch (err) {
      showToast('Failed to load training data: ' + err.message, 'error');
    }
  }
}

function bindTrainingEvents(container) {
  const actionBtns = container.querySelectorAll('.course-action-btn');
  actionBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const course = trainings.find(t => t.id === id);
      if (!course) return;

      try {
        if (course.status === 'Not Started') {
          await api.startTrainingCourse(parseInt(id));
          showToast(`Started "${course.title}"`, 'success');
        } else if (course.status === 'In Progress') {
          await api.completeTrainingCourse(parseInt(id));
          showToast(`"${course.title}" completed! +${course.xp} XP`, 'success');
        }
        // Refresh the page
        const container = document.querySelector('#content-viewport');
        if (container) {
          const { renderSocialPage } = await import('./social.js');
          await renderSocialPage(container, 'training-completion');
        }
      } catch (err) {
        showToast('Failed: ' + err.message, 'error');
      }
    });
  });
}

/**
 * Renders HTML for active tab
 */
function renderActiveSectionPanel(key) {
  switch (key) {
    case 'csr-activities':
      return renderCSRActivities();
    case 'employee-participation':
      return renderEmployeeParticipation();
    case 'diversity-dashboard':
      return renderDiversityDashboard();
    case 'training-completion':
      return renderTrainingCompletion();
    default:
      return `<div class="glass-card">Select a sub-section from the navigation tabs above.</div>`;
  }
}

// ----------------------------------------------------
// 1. CSR Activities Panel
// ----------------------------------------------------
function renderCSRActivities() {
  const cardsHtml = activities.map(a => `
    <div class="glass-card csr-activity-card ${a.joined ? 'joined' : ''}" data-id="${a.id}">
      <div class="csr-card-top">
        <div class="csr-card-header-row">
          <span class="csr-emoji-title">${a.emoji} ${a.title}</span>
          <span class="csr-xp-badge">${a.xp} XP</span>
        </div>
        <div class="csr-joined-text">${a.joinedCount} joined</div>
        <div class="csr-req-text">${a.requirement}</div>
      </div>
      <button class="join-btn ${a.joined ? 'joined' : ''}" data-id="${a.id}">
        ${a.joined ? 'Leave' : 'Join'}
      </button>
    </div>
  `).join('');

  const queueRows = approvalQueue.map(q => {
    const isSelected = selectedQueueId === q.id;
    let statusClass = 'status-pill-pending';
    if (q.status === 'Approved') statusClass = 'status-pill-approved';
    if (q.status === 'Rejected') statusClass = 'status-pill-rejected';

    return `
      <tr class="queue-row ${isSelected ? 'selected' : ''}" data-id="${q.id}">
        <td><strong>${q.employee}</strong></td>
        <td>${q.activity}</td>
        <td><span class="proof-file"><i data-lucide="file-text"></i> ${q.proof}</span></td>
        <td><strong>${q.points}</strong></td>
        <td><span class="status-pill ${statusClass}">${q.status}</span></td>
      </tr>
    `;
  }).join('');

  const buttonsDisabled = selectedQueueId ? '' : 'disabled';

  return `
    <div class="csr-actions-bar">
      <button class="btn btn-info btn-pill" id="btn-new-activity">
        <i data-lucide="plus"></i> New Activity
      </button>
    </div>

    <div class="grid-4 csr-grid">
      ${cardsHtml}
    </div>

    <div class="section-title">Employee Participation: approval queue</div>

    <div class="view-card no-padding" style="margin-top: 0;">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Activity/Challenge</th>
              <th>Proof</th>
              <th>Points</th>
              <th>Approval</th>
            </tr>
          </thead>
          <tbody>
            ${queueRows.length > 0 ? queueRows : '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No entries in the approval queue.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <div class="table-footer-actions">
      <button class="btn btn-info" id="btn-approve-submission" ${buttonsDisabled}>Approve</button>
      <button class="btn btn-red" id="btn-reject-submission" ${buttonsDisabled}>Reject</button>
    </div>
  `;
}

// ----------------------------------------------------
// 2. Employee Participation Panel
// ----------------------------------------------------
function renderEmployeeParticipation() {
  const pendingCount = approvalQueue.filter(q => q.status === 'Pending').length;
  const approvedCount = approvalQueue.filter(q => q.status === 'Approved').length;

  // Calculate dynamic XP
  const basePoints = 33600;
  const dynamicPoints = approvalQueue
    .filter(q => q.status === 'Approved')
    .reduce((sum, q) => sum + q.points, 0) * 10;
  const totalXP = basePoints + dynamicPoints;

  const rows = approvalQueue.map(q => {
    let statusClass = 'status-pill-pending';
    if (q.status === 'Approved') statusClass = 'status-pill-approved';
    if (q.status === 'Rejected') statusClass = 'status-pill-rejected';

    const isPending = q.status === 'Pending';
    const actionCell = isPending
      ? `<div class="action-buttons-group">
           <button class="action-btn-mini btn-approve" data-id="${q.id}" title="Approve"><i data-lucide="check"></i></button>
           <button class="action-btn-mini btn-reject" data-id="${q.id}" title="Reject"><i data-lucide="x"></i></button>
         </div>`
      : `<span class="verified-text"><i data-lucide="shield-check"></i> Verified</span>`;

    return `
      <tr>
        <td><strong>${q.employee}</strong></td>
        <td>${q.activity}</td>
        <td><a href="#" class="proof-link"><i data-lucide="file-text"></i> ${q.proof}</a></td>
        <td>2026-07-12</td>
        <td>${q.points} XP</td>
        <td><span class="status-pill ${statusClass}">${q.status}</span></td>
        <td>${actionCell}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="grid-3">
      <div class="glass-card stat-box border-info">
        <span class="stat-lbl">Pending Submissions</span>
        <h3>${pendingCount}</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Approved Submissions</span>
        <h3>${approvedCount}</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Earned Employee Points</span>
        <h3>${totalXP.toLocaleString()} XP</h3>
      </div>
    </div>

    <div class="view-card" style="margin-top: 24px;">
      <div class="card-header" style="margin-bottom: 16px;">
        <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight:600;">Submissions for Review</h3>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>CSR Activity</th>
              <th>Proof Attached</th>
              <th>Completion Date</th>
              <th>XP Earned</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length > 0 ? rows : '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No records found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. Diversity Dashboard Panel
// ----------------------------------------------------
function renderDiversityDashboard(metrics) {
  return `
    <div class="grid-3">
      <div class="glass-card stat-box">
        <span class="stat-lbl">Women in Leadership</span>
        <h3>${metrics?.women_in_leadership ?? '42%'}</h3>
        <span class="sub-label">${metrics?.women_leadership_goal ?? 'Goal: 50% by 2028'}</span>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Global Demographics</span>
        <h3>${metrics?.global_demographics ?? '12 Nationalities'}</h3>
        <span class="sub-label">${metrics?.demographics_desc ?? 'Across 3 regional offices'}</span>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Inclusion Index Score</span>
        <h3>${metrics?.inclusion_score ?? '8.4 / 10'}</h3>
        <span class="sub-label">${metrics?.inclusion_desc ?? 'From annual survey results'}</span>
      </div>
    </div>

    <div class="grid-2" style="margin-top: 24px;">
      <div class="view-card">
        <div class="card-header" style="margin-bottom: 16px;">
          <h3 style="font-family: var(--font-heading); font-size:16px; font-weight:600;">Gender Distribution</h3>
        </div>
        
        <div class="distribution-chart-wrapper">
          <div class="distribution-chart-mock">
            <div class="chart-segment segment-female" style="width: 48%;" title="Female (48%)"></div>
            <div class="chart-segment segment-male" style="width: 47%;" title="Male (47%)"></div>
            <div class="chart-segment segment-nonbinary" style="width: 5%;" title="Non-binary/Other (5%)"></div>
          </div>
          <div class="chart-legend">
            <div class="legend-item"><span class="legend-dot female-dot"></span> Female: 48%</div>
            <div class="legend-item"><span class="legend-dot male-dot"></span> Male: 47%</div>
            <div class="legend-item"><span class="legend-dot nonbinary-dot"></span> Other: 5%</div>
          </div>
        </div>

        <div style="margin-top: 32px;">
          <h4 style="margin-bottom: 12px; font-family: var(--font-heading); font-size:14px; font-weight:600;">Demographics Trends</h4>
          <svg viewBox="0 0 400 150" class="diversity-svg" style="width: 100%; height: 150px; background: rgba(0,0,0,0.1); border-radius: var(--radius-md);">
            <!-- Grid lines -->
            <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" />
            <line x1="40" y1="60" x2="380" y2="60" stroke="rgba(255,255,255,0.03)" />
            <line x1="40" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.03)" />
            <line x1="40" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.08)" />
            
            <!-- Trend Line: Women in leadership -->
            <path d="M 50 110 L 130 98 L 210 85 L 290 70 L 370 55" fill="none" stroke="var(--accent-info)" stroke-width="3" stroke-linecap="round" />
            <circle cx="50" cy="110" r="4" fill="var(--accent-info)" />
            <circle cx="130" cy="98" r="4" fill="var(--accent-info)" />
            <circle cx="210" cy="85" r="4" fill="var(--accent-info)" />
            <circle cx="290" cy="70" r="4" fill="var(--accent-info)" />
            <circle cx="370" cy="55" r="4" fill="var(--accent-info)" />
            
            <!-- Trend Line: Inclusion Index -->
            <path d="M 50 80 L 130 75 L 210 68 L 290 55 L 370 45" fill="none" stroke="#EC4899" stroke-width="3" stroke-linecap="round" />
            <circle cx="50" cy="80" r="4" fill="#EC4899" />
            <circle cx="130" cy="75" r="4" fill="#EC4899" />
            <circle cx="210" cy="68" r="4" fill="#EC4899" />
            <circle cx="290" cy="55" r="4" fill="#EC4899" />
            <circle cx="370" cy="45" r="4" fill="#EC4899" />
            
            <!-- Axis Labels -->
            <text x="50" y="140" fill="var(--text-muted)" font-size="9" text-anchor="middle">2022</text>
            <text x="130" y="140" fill="var(--text-muted)" font-size="9" text-anchor="middle">2023</text>
            <text x="210" y="140" fill="var(--text-muted)" font-size="9" text-anchor="middle">2024</text>
            <text x="290" y="140" fill="var(--text-muted)" font-size="9" text-anchor="middle">2025</text>
            <text x="370" y="140" fill="var(--text-muted)" font-size="9" text-anchor="middle">2026</text>
            
            <text x="18" y="60" fill="var(--text-muted)" font-size="8" text-anchor="middle" transform="rotate(-90 18 60)">Metrics %</text>
          </svg>
          <div style="display:flex; justify-content:center; gap:16px; margin-top:8px; font-size:11px; color:var(--text-secondary);">
            <div><span style="display:inline-block; width:8px; height:8px; background:var(--accent-info); border-radius:50%; margin-right:4px;"></span> Women in Leadership (%)</div>
            <div><span style="display:inline-block; width:8px; height:8px; background:#EC4899; border-radius:50%; margin-right:4px;"></span> Inclusion Score (x10)</div>
          </div>
        </div>
      </div>

      <div class="view-card">
        <div class="card-header" style="margin-bottom: 16px;">
          <h3 style="font-family: var(--font-heading); font-size: 16px; font-weight:600;">Departmental Diversity Balance</h3>
        </div>
        <div class="list-container">
          <div class="list-item">
            <div class="item-info">
              <strong>Product & Design</strong>
              <span class="item-sub">Balanced gender and background metrics</span>
            </div>
            <span class="score-badge score-a">A</span>
          </div>
          <div class="list-item">
            <div class="item-info">
              <strong>Engineering</strong>
              <span class="item-sub">Gender balance improvements ongoing</span>
            </div>
            <span class="score-badge score-b">B</span>
          </div>
          <div class="list-item">
            <div class="item-info">
              <strong>Sales & Marketing</strong>
              <span class="item-sub">Diverse hiring goals achieved for Q2</span>
            </div>
            <span class="score-badge score-a">A-</span>
          </div>
          <div class="list-item">
            <div class="item-info">
              <strong>Operations & Supply Chain</strong>
              <span class="item-sub">Targeting broader regional recruitment</span>
            </div>
            <span class="score-badge score-b">B-</span>
          </div>
          <div class="list-item">
            <div class="item-info">
              <strong>Finance & Legal</strong>
              <span class="item-sub">Consistently high demographics diversity</span>
            </div>
            <span class="score-badge score-a">A</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. Training Completion Panel
// ----------------------------------------------------
function renderTrainingCompletion() {
  if (!trainings.length) {
    return `<div class="glass-card"><p style="text-align:center;padding:24px;">No training courses available.</p></div>`;
  }
  const completedTrainings = trainings.filter(t => t.status === 'Completed').length;
  const inProgressTrainings = trainings.filter(t => t.status === 'In Progress').length;
  const totalCourses = trainings.length;

  const userTrainingXP = trainings
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + t.xp, 0);

  const cardsHtml = trainings.map(t => {
    let statusClass = 'status-pill-pending';
    let btnText = 'Start Course';
    let btnClass = 'btn-info';

    if (t.status === 'In Progress') {
      statusClass = 'status-pill-pending';
      btnText = 'Complete Course';
      btnClass = 'btn-orange';
    } else if (t.status === 'Completed') {
      statusClass = 'status-pill-approved';
      btnText = 'Review Material';
      btnClass = 'btn-secondary';
    }

    return `
      <div class="glass-card training-card ${t.status === 'Completed' ? 'completed' : ''}" data-id="${t.id}">
        <div class="training-card-top">
          <div class="training-header-row">
            <span class="training-category-tag">${t.category}</span>
            <span class="csr-xp-badge">${t.xp} XP</span>
          </div>
          <h4 class="training-title">${t.title}</h4>
          <div style="margin-top: 12px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-secondary); margin-bottom:4px;">
              <span>Company Completion</span>
              <span>${t.completionRate}%</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${t.completionRate}%;"></div>
            </div>
          </div>
        </div>
        <div class="training-card-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top: 14px;">
          <span class="status-pill ${statusClass}">${t.status}</span>
          <button class="btn ${btnClass} btn-sm course-action-btn" data-id="${t.id}">
            ${btnText}
          </button>
        </div>
      </div>
    `;
  }).join('');

  const logRows = trainingLog.map(l => {
    return `
      <tr>
        <td><strong>${l.employee}</strong></td>
        <td>${l.course}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:12px; color:var(--text-secondary); font-weight:600;">${l.progress}%</span>
            <div class="progress-bar-container" style="width:60px; height:6px;">
              <div class="progress-bar-fill" style="width: ${l.progress}%;"></div>
            </div>
          </div>
        </td>
        <td>${l.completedDate}</td>
        <td><strong class="success-text">${l.xp > 0 ? '+' + l.xp + ' XP' : '-'}</strong></td>
      </tr>
    `;
  }).join('');

  return `
    <div class="grid-3">
      <div class="glass-card stat-box border-info">
        <span class="stat-lbl">Required Modules Completed</span>
        <h3>${completedTrainings} / ${trainings.filter(t => t.category === 'Required').length}</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Modules In Progress</span>
        <h3>${inProgressTrainings}</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Accumulated Training Points</span>
        <h3>${userTrainingXP.toLocaleString()} XP</h3>
      </div>
    </div>

    <div class="section-title">Available Training Modules</div>
    <div class="grid-3 training-grid">
      ${cardsHtml}
    </div>

    <div class="section-title" style="margin-top: 32px;">Employee Training Log</div>
    <div class="view-card no-padding" style="margin-top: 0;">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Course / Seminar</th>
              <th>Progress</th>
              <th>Date Completed</th>
              <th>Points Awarded</th>
            </tr>
          </thead>
          <tbody>
            ${logRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// Event Binding Functions
// ----------------------------------------------------
function bindActivePanelEvents(container, pageKey) {
  if (pageKey === 'csr-activities') {
    // 1. "+ New Activity" button click
    const btnNewActivity = container.querySelector('#btn-new-activity');
    if (btnNewActivity) {
      btnNewActivity.addEventListener('click', () => {
        showNewActivityModal(container);
      });
    }

    // 2. Join buttons inside cards
    const joinButtons = container.querySelectorAll('.join-btn');
    joinButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const activity = activities.find(a => a.id === id);
        if (!activity) return;

        if (activity.joined) {
          // Leave activity
          activity.joined = false;
          activity.joinedCount--;
          approvalQueue = approvalQueue.filter(q => !(q.employee === 'Aditi Rao' && q.activity === activity.title));
          renderSocialPage(container, pageKey);
        } else {
          if (activity.requirement === 'Open') {
            activity.joined = true;
            activity.joinedCount++;
            try {
              await api.joinActivity(id);
            } catch (err) {
              showToast('Failed to join activity: ' + err.message, 'error');
              activity.joined = false;
              activity.joinedCount--;
              return;
            }
            renderSocialPage(container, pageKey);
          } else {
            showSubmitProofModal(container, activity);
          }
        }
      });
    });

    // 3. Queue row selection
    const queueRows = container.querySelectorAll('.queue-row');
    queueRows.forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        if (selectedQueueId === id) {
          selectedQueueId = null;
        } else {
          selectedQueueId = id;
        }
        renderSocialPage(container, pageKey);
      });
    });

    // 4. Approve button
    const btnApprove = container.querySelector('#btn-approve-submission');
    if (btnApprove) {
      btnApprove.addEventListener('click', async () => {
        if (!selectedQueueId) return;
        const entry = approvalQueue.find(q => q.id === selectedQueueId);
        if (entry) {
          const settings = JSON.parse(localStorage.getItem('esg_settings') || '{}');
          const isEvidenceRequired = settings.evidenceRequirement !== false;
          if (isEvidenceRequired && (!entry.proof || entry.proof.trim() === '' || entry.proof.toLowerCase() === 'none')) {
            showSocialToast('Approval Blocked: Proof/evidence file is required when "Require evidence for all CSR activities" is active.', 'warning');
            return;
          }
          try {
            await api.approveParticipation(selectedQueueId);
          } catch (err) {
            showToast('Failed to approve: ' + err.message, 'error');
            return;
          }
          entry.status = 'Approved';
          showSocialToast(`Submission for "${entry.activity}" approved successfully!`, 'success');
        }
        selectedQueueId = null;
        renderSocialPage(container, pageKey);
      });
    }

    // 5. Reject button
    const btnReject = container.querySelector('#btn-reject-submission');
    if (btnReject) {
      btnReject.addEventListener('click', () => {
        if (!selectedQueueId) return;
        const entry = approvalQueue.find(q => q.id === selectedQueueId);
        if (entry) {
          entry.status = 'Rejected';
          showSocialToast(`Submission for "${entry.activity}" rejected.`, 'success');
        }
        selectedQueueId = null;
        renderSocialPage(container, pageKey);
      });
    }

  } else if (pageKey === 'employee-participation') {
    // Mini Approve/Reject action buttons inside the table rows
    const approveButtons = container.querySelectorAll('.btn-approve');
    approveButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const entry = approvalQueue.find(q => q.id === id);
        if (entry) {
          const settings = JSON.parse(localStorage.getItem('esg_settings') || '{}');
          const isEvidenceRequired = settings.evidenceRequirement !== false;
          if (isEvidenceRequired && (!entry.proof || entry.proof.trim() === '' || entry.proof.toLowerCase() === 'none')) {
            showSocialToast('Approval Blocked: Proof/evidence file is required when "Require evidence for all CSR activities" is active.', 'warning');
            return;
          }
          try {
            await api.approveParticipation(id);
          } catch (err) {
            showToast('Failed to approve: ' + err.message, 'error');
            return;
          }
          entry.status = 'Approved';
          showSocialToast(`Submission for "${entry.activity}" approved successfully!`, 'success');
        }
        renderSocialPage(container, pageKey);
      });
    });

    const rejectButtons = container.querySelectorAll('.btn-reject');
    rejectButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const entry = approvalQueue.find(q => q.id === id);
        if (entry) {
          entry.status = 'Rejected';
          showSocialToast(`Submission for "${entry.activity}" rejected.`, 'success');
        }
        renderSocialPage(container, pageKey);
      });
    });

  } else if (pageKey === 'training-completion') {
    // Events are bound by bindTrainingEvents called after data fetch
  }
}

// ----------------------------------------------------
// Modal Popups Implementation
// ----------------------------------------------------
function showNewActivityModal(container) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'social-modal-overlay';
  backdrop.innerHTML = `
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3 class="modal-title">Create CSR Activity</h3>
        <button class="modal-close-btn" id="btn-close-modal" type="button">
          <i data-lucide="x"></i>
        </button>
      </div>
      <form id="social-modal-form" class="action-form">
        <div class="form-group">
          <label>Activity Emoji Icon (e.g. 🌳, 🩸, 🏖️, 🎓)</label>
          <input type="text" name="emoji" class="form-input" value="🌟" required />
        </div>
        <div class="form-group">
          <label>Activity Title</label>
          <input type="text" name="title" class="form-input" placeholder="e.g. Food Bank Drive" required />
        </div>
        <div class="form-group">
          <label>Points Value (XP)</label>
          <input type="number" name="xp" class="form-input" value="50" min="10" required />
        </div>
        <div class="form-group">
          <label>Participation Requirement</label>
          <select name="requirement" class="form-input" required>
            <option value="Evidence Required">Evidence Required</option>
            <option value="Open">Open (No Proof Required)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Initial Joined Count</label>
          <input type="number" name="joinedCount" class="form-input" value="0" min="0" required />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-info">Create Activity</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);
  setTimeout(() => backdrop.classList.add('show'), 10);

  if (window.lucide) {
    window.lucide.createIcons({
      attrs: { class: 'lucide-icon' },
      nameAttr: 'data-lucide',
      nodeList: backdrop.querySelectorAll('[data-lucide]')
    });
  }

  const closeModal = () => {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.remove(), 250);
  };

  backdrop.querySelector('#btn-close-modal').addEventListener('click', closeModal);
  backdrop.querySelector('#btn-cancel-modal').addEventListener('click', closeModal);

  backdrop.querySelector('#social-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const xpRaw = formData.get('xp');
    const xpVal = parseInt(xpRaw, 10);
    const requirement = formData.get('requirement');

    if (!title || title.trim().length < 1 || title.length > 200) {
      showToast('Activity title must be between 1 and 200 characters.', 'warning');
      return;
    }
    if (isNaN(xpVal) || xpVal < 0 || xpVal > 10000) {
      showToast('XP reward must be between 0 and 10000.', 'warning');
      return;
    }

    try {
      await api.createActivity({
        title: title.trim(),
        description: '',
        category_id: 1,
        date: new Date().toISOString().split('T')[0],
        points_reward: xpVal,
        max_participants: 50,
        status: requirement === 'Open' ? 'Upcoming' : 'Ongoing'
      });
    } catch (err) {
      showToast('Failed to create activity: ' + err.message, 'error');
      return;
    }
    closeModal();
    renderSocialPage(container, 'csr-activities');
  });
}

function showSubmitProofModal(container, activity) {
  const settings = JSON.parse(localStorage.getItem('esg_settings') || '{}');
  const isEvidenceRequired = settings.evidenceRequirement !== false; // default true

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'social-modal-overlay';
  backdrop.innerHTML = `
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3 class="modal-title">Submit Proof of Participation</h3>
        <button class="modal-close-btn" id="btn-close-modal" type="button">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
        Joining CSR Event: <strong>${activity.emoji} ${activity.title}</strong> (${activity.xp} XP)
      </div>
      ${isEvidenceRequired ? `<div style="font-size: 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius-sm); padding: 8px 12px; margin-bottom: 12px; color: #fca5a5;">
        <strong>⚠ Evidence Required:</strong> A proof file or link is mandatory for this submission.
      </div>` : ''}
      <form id="social-modal-form" class="action-form">
        <div class="form-group">
          <label>Employee Name</label>
          <input type="text" name="employee" class="form-input" value="Aditi Rao" placeholder="Enter your full name" required />
        </div>
        <div class="form-group">
          <label>Proof Attachment (Filename / Link) ${isEvidenceRequired ? '<span style="color: var(--accent-danger);">*</span>' : '<span style="color: var(--text-muted); font-weight: normal;">(Optional)</span>'}</label>
          <input type="text" name="proof" class="form-input" value="" placeholder="${isEvidenceRequired ? 'e.g. tree_plantation_selfie.png (required)' : 'e.g. photo.jpg (optional)'}" ${isEvidenceRequired ? 'required' : ''} />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-info">Submit & Join</button>
        </div>
      </form>
    </div>
  `;


  document.body.appendChild(backdrop);
  setTimeout(() => backdrop.classList.add('show'), 10);

  if (window.lucide) {
    window.lucide.createIcons({
      attrs: { class: 'lucide-icon' },
      nameAttr: 'data-lucide',
      nodeList: backdrop.querySelectorAll('[data-lucide]')
    });
  }

  const closeModal = () => {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.remove(), 250);
  };

  backdrop.querySelector('#btn-close-modal').addEventListener('click', closeModal);
  backdrop.querySelector('#btn-cancel-modal').addEventListener('click', closeModal);

  backdrop.querySelector('#social-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const employee = formData.get('employee');
    const proof = formData.get('proof');

    if (!employee || employee.trim().length < 1 || employee.length > 100) {
      showToast('Employee name must be between 1 and 100 characters.', 'warning');
      return;
    }
    if (proof && proof.length > 500) {
      showToast('Proof file URL is too long (max 500 characters).', 'warning');
      return;
    }

    try {
      await api.submitProof(activity.id, proof);
    } catch (err) {
      showToast('Failed to submit proof: ' + err.message, 'error');
      return;
    }
    activity.joined = true;
    activity.joinedCount++;
    closeModal();
    renderSocialPage(container, 'csr-activities');
  });
}

// ----------------------------------------------------
// Style Definitions
// ----------------------------------------------------
function getSocialCSS() {
  return `
    /* Actions Bar */
    .csr-actions-bar {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin-bottom: 20px;
    }
    
    /* Grid layouts */
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }
    
    @media (max-width: 1024px) {
      .grid-4 { grid-template-columns: repeat(2, 1fr); }
      .grid-3 { grid-template-columns: repeat(2, 1fr); }
      .grid-2 { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .grid-4 { grid-template-columns: 1fr; }
      .grid-3 { grid-template-columns: 1fr; }
    }

    /* CSR Activity Card */
    .csr-activity-card {
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 180px;
      background: rgba(21, 26, 38, 0.6);
      backdrop-filter: blur(10px);
      transition: all var(--transition-normal);
    }
    .csr-activity-card:hover {
      border-color: var(--accent-info);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
    }
    .csr-activity-card.joined {
      border-color: var(--accent-success);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
    }
    .csr-card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 8px;
    }
    .csr-emoji-title {
      font-family: var(--font-heading);
      font-size: 15.5px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.4;
    }
    .csr-xp-badge {
      background-color: rgba(59, 130, 246, 0.15);
      color: var(--accent-info);
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-full);
      white-space: nowrap;
    }
    .csr-joined-text {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }
    .csr-req-text {
      font-size: 12px;
      color: var(--text-muted);
    }
    .join-btn {
      align-self: flex-start;
      background-color: var(--accent-info);
      color: white;
      padding: 8px 18px;
      border-radius: var(--radius-sm);
      border: none;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all var(--transition-fast);
      margin-top: 14px;
    }
    .join-btn:hover {
      background-color: #2563eb;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
    }
    .join-btn.joined {
      background-color: transparent;
      color: var(--accent-success);
      border: 1px solid var(--accent-success);
    }
    .join-btn.joined:hover {
      background-color: rgba(16, 185, 129, 0.1);
      box-shadow: none;
    }

    /* Section Title */
    .section-title {
      font-family: var(--font-heading);
      font-size: 16px;
      color: var(--text-primary);
      margin-top: 32px;
      margin-bottom: 16px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    /* Table and rows */
    .view-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-md);
    }
    .view-card.no-padding {
      padding: 0;
      overflow: hidden;
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
      padding: 14px 18px;
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
    .data-table tbody tr {
      transition: background-color var(--transition-fast);
    }
    .data-table tbody tr.queue-row {
      cursor: pointer;
    }
    .data-table tbody tr.queue-row:hover {
      background-color: rgba(255,255,255,0.02);
    }
    .data-table tbody tr.selected {
      background-color: rgba(59, 130, 246, 0.1) !important;
    }
    .proof-file {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-secondary);
    }
    .proof-file i {
      width: 14px;
      height: 14px;
      color: var(--text-muted);
    }

    /* Status Pills matching the mockup */
    .status-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 12px;
      border-radius: var(--radius-sm);
      font-size: 11px;
      font-weight: 600;
      border: 1px solid transparent;
    }
    .status-pill-pending {
      border-color: #F59E0B;
      color: #F59E0B;
      background-color: rgba(245, 158, 11, 0.05);
    }
    .status-pill-approved {
      border-color: #10B981;
      color: #10B981;
      background-color: rgba(16, 185, 129, 0.05);
    }
    .status-pill-rejected {
      border-color: #EF4444;
      color: #EF4444;
      background-color: rgba(239, 68, 68, 0.05);
    }

    /* Table Footer Actions */
    .table-footer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }

    /* Stat box */
    .stat-box {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: rgba(21, 26, 38, 0.4);
      backdrop-filter: blur(10px);
    }
    .stat-box.border-info {
      border-color: rgba(59, 130, 246, 0.3);
    }
    .stat-lbl {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .stat-box h3 {
      font-family: var(--font-heading);
      font-size: 26px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .sub-label {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Action Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 18px;
      border: none;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 13.5px;
      cursor: pointer;
      transition: background-color var(--transition-fast), opacity var(--transition-fast);
      color: white;
    }
    .btn-info {
      background-color: var(--accent-info);
    }
    .btn-info:hover:not(:disabled) {
      background-color: #2563eb;
    }
    .btn-red {
      background-color: #F43F5E;
    }
    .btn-red:hover:not(:disabled) {
      background-color: #e11d48;
    }
    .btn-secondary {
      background-color: rgba(255,255,255,0.05);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    .btn-secondary:hover {
      background-color: rgba(255,255,255,0.1);
    }
    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .btn-pill {
      border-radius: var(--radius-full);
    }

    /* Modal Dialog styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(8, 11, 17, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity var(--transition-normal);
    }
    .modal-backdrop.show {
      opacity: 1;
    }
    .modal-content {
      width: 100%;
      max-width: 480px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      transform: scale(0.95);
      transition: transform var(--transition-normal);
    }
    .modal-backdrop.show .modal-content {
      transform: scale(1);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .modal-close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border-radius: 50%;
      transition: all var(--transition-fast);
    }
    .modal-close-btn:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    .form-group label {
      font-size: 12.5px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .form-input {
      background-color: rgba(0,0,0,0.25);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      color: var(--text-primary);
      font-size: 13.5px;
      transition: border-color var(--transition-fast);
    }
    .form-input:focus {
      outline: none;
      border-color: var(--accent-info);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }

    /* Employee Review styles */
    .proof-link {
      color: var(--accent-info);
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
      transition: background-color var(--transition-fast);
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

    /* Diversity styles */
    .distribution-chart-wrapper {
      margin-top: 16px;
      margin-bottom: 16px;
    }
    .distribution-chart-mock {
      height: 24px;
      width: 100%;
      background-color: rgba(255,255,255,0.05);
      border-radius: var(--radius-full);
      overflow: hidden;
      display: flex;
      margin-bottom: 16px;
      border: 1px solid var(--border-color);
    }
    .chart-segment {
      height: 100%;
      transition: width var(--transition-normal);
    }
    .segment-female { background-color: #EC4899; box-shadow: inset 0 0 10px rgba(236,72,153,0.5); }
    .segment-male { background-color: #3B82F6; box-shadow: inset 0 0 10px rgba(59,130,246,0.5); }
    .segment-nonbinary { background-color: #8B5CF6; box-shadow: inset 0 0 10px rgba(139,92,246,0.5); }
    
    .chart-legend {
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    .legend-item {
      font-size: 12.5px;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .female-dot { background-color: #EC4899; }
    .male-dot { background-color: #3B82F6; }
    .nonbinary-dot { background-color: #8B5CF6; }
    
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.01);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      transition: background-color var(--transition-fast), border-color var(--transition-fast);
    }
    .list-item:hover {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255,255,255,0.1);
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
    .score-badge {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 15px;
    }
    .score-a {
      background-color: rgba(16, 185, 129, 0.15);
      color: var(--accent-success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .score-b {
      background-color: rgba(245, 158, 11, 0.15);
      color: var(--accent-gamification);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    /* Training cards styling */
    .training-card {
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 200px;
      background: rgba(21, 26, 38, 0.5);
      backdrop-filter: blur(10px);
      transition: all var(--transition-normal);
    }
    .training-card:hover {
      border-color: var(--accent-info);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
    }
    .training-card.completed {
      border-color: var(--accent-success);
    }
    .training-category-tag {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      background-color: rgba(255,255,255,0.02);
    }
    .training-title {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      margin-top: 10px;
      line-height: 1.4;
      flex-grow: 1;
    }
    .progress-bar-container {
      width: 100%;
      height: 8px;
      background-color: rgba(255,255,255,0.05);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background-color: var(--accent-info);
      border-radius: var(--radius-full);
      transition: width var(--transition-normal);
    }
    .training-card.completed .progress-bar-fill {
      background-color: var(--accent-success);
    }
    .btn-orange {
      background-color: #F59E0B;
    }
    .btn-orange:hover {
      background-color: #d97706;
    }
    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }
    .success-text {
      color: var(--accent-success);
    }

    /* Social Toast Notifications */
    .social-toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 3000;
    }
    .social-toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 12px 18px;
      border-radius: var(--radius-md);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      min-width: 260px;
      max-width: 420px;
      font-size: 13px;
    }
    .social-toast.visible {
      transform: translateY(0);
      opacity: 1;
    }
    .social-toast-success {
      background: #1e3a2e;
      border: 1px solid #16a34a;
      color: #bbf7d0;
    }
    .social-toast-warning {
      background: #3b1a1a;
      border: 1px solid #dc2626;
      color: #fecaca;
    }
    .social-toast-close {
      background: none;
      border: none;
      color: currentColor;
      font-size: 16px;
      cursor: pointer;
      opacity: 0.7;
      padding: 0;
      line-height: 1;
    }
    .social-toast-close:hover { opacity: 1; }
  `;
}

function showSocialToast(message, type = 'success') {
  let container = document.getElementById('social-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'social-toast-container';
    container.className = 'social-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `social-toast social-toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="social-toast-close">&times;</button>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('visible'));
  });

  const dismissTimer = setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 4500);

  toast.querySelector('.social-toast-close').addEventListener('click', () => {
    clearTimeout(dismissTimer);
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  });
}
