/**
 * EcoSphere Social Module View Component
 */

export function renderSocialPage(container, pageKey) {
  let contentHtml = '';

  if (pageKey === 'csr-activities') {
    contentHtml = renderCSRActivities();
  } else if (pageKey === 'employee-participation') {
    contentHtml = renderEmployeeParticipation();
  } else if (pageKey === 'diversity-dashboard') {
    contentHtml = renderDiversityDashboard();
  }

  container.innerHTML = `
    <div class="view-container">
      <div class="view-header">
        <h1 class="view-title">${getSocialTitle(pageKey)}</h1>
        <p class="view-description">${getSocialDesc(pageKey)}</p>
      </div>
      ${contentHtml}
    </div>
  `;
}

function getSocialTitle(key) {
  switch (key) {
    case 'csr-activities': return 'CSR Activities';
    case 'employee-participation': return 'Employee Participation';
    case 'diversity-dashboard': return 'Diversity Dashboard';
    default: return 'Social';
  }
}

function getSocialDesc(key) {
  switch (key) {
    case 'csr-activities': return 'Browse, organize, or join corporate social responsibility projects run by our organization.';
    case 'employee-participation': return 'Approve or track employee involvement in CSR projects and verify participation submissions.';
    case 'diversity-dashboard': return 'Analyze employee demographics, gender representation, and inclusion metrics across departments.';
    default: return 'Configure and manage your organization\'s social responsibility metrics.';
  }
}

// ----------------------------------------------------
// Page Renders
// ----------------------------------------------------

function renderCSRActivities() {
  return `
    <div class="table-actions">
      <div class="filters-row">
        <select class="filter-dropdown">
          <option>All Statuses</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>
      <button class="btn btn-info"><i data-lucide="plus"></i> Create CSR Activity</button>
    </div>

    <div class="grid-3">
      <div class="glass-card csr-activity-card">
        <div class="csr-header">
          <span class="status-tag status-tag-active">Open</span>
          <span class="points-worth">300 XP</span>
        </div>
        <h4 class="csr-title">Local Beach Clean-up Campaign</h4>
        <p class="csr-desc">Help remove plastic and debris from the local beach to protect marine ecosystems.</p>
        <div class="csr-meta">
          <div class="meta-item"><i data-lucide="calendar"></i> <span>July 25, 2026</span></div>
          <div class="meta-item"><i data-lucide="map-pin"></i> <span>Bay Area Coastal</span></div>
          <div class="meta-item"><i data-lucide="user"></i> <span>Organizer: HR Green Team</span></div>
        </div>
        <button class="btn btn-info btn-secondary full-width">Sign Up Now</button>
      </div>

      <div class="glass-card csr-activity-card">
        <div class="csr-header">
          <span class="status-tag status-tag-active">Open</span>
          <span class="points-worth">150 XP</span>
        </div>
        <h4 class="csr-title">Tree Planting Day</h4>
        <p class="csr-desc">Help us plant 500 indigenous saplings in the urban park to improve city canopy cover.</p>
        <div class="csr-meta">
          <div class="meta-item"><i data-lucide="calendar"></i> <span>August 12, 2026</span></div>
          <div class="meta-item"><i data-lucide="map-pin"></i> <span>City Central Park</span></div>
          <div class="meta-item"><i data-lucide="user"></i> <span>Organizer: Operations</span></div>
        </div>
        <button class="btn btn-info btn-secondary full-width">Sign Up Now</button>
      </div>

      <div class="glass-card csr-activity-card">
        <div class="csr-header">
          <span class="status-tag status-tag-pending">In Progress</span>
          <span class="points-worth">500 XP</span>
        </div>
        <h4 class="csr-title">Energy Conservation Workshop</h4>
        <p class="csr-desc">Educational workshop teaching households and staff tips on home insulation and smart cooling.</p>
        <div class="csr-meta">
          <div class="meta-item"><i data-lucide="calendar"></i> <span>Ongoing</span></div>
          <div class="meta-item"><i data-lucide="map-pin"></i> <span>Corporate Hall</span></div>
          <div class="meta-item"><i data-lucide="user"></i> <span>Organizer: Tech Division</span></div>
        </div>
        <button class="btn btn-info btn-secondary full-width" disabled>Registration Closed</button>
      </div>
    </div>

    <style>${getSocialCSS()}</style>
  `;
}

function renderEmployeeParticipation() {
  return `
    <div class="grid-3">
      <div class="glass-card stat-box border-info">
        <span class="stat-lbl">Pending Submissions</span>
        <h3>4</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Approved Submissions</span>
        <h3>112</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Earned Employee Points</span>
        <h3>33,600</h3>
      </div>
    </div>

    <div class="view-card">
      <div class="card-header">
        <h3>Submissions for Review</h3>
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
            <tr>
              <td><strong>Mark Robinson</strong></td>
              <td>Local Beach Clean-up Campaign</td>
              <td><a href="#" class="proof-link"><i data-lucide="file-text"></i> beach_cleanup_photo.jpg</a></td>
              <td>2026-07-11</td>
              <td>300 XP</td>
              <td><span class="status-tag status-tag-pending">Pending Review</span></td>
              <td>
                <div class="action-buttons-group">
                  <button class="action-btn-mini btn-approve" title="Approve"><i data-lucide="check"></i></button>
                  <button class="action-btn-mini btn-reject" title="Reject"><i data-lucide="x"></i></button>
                </div>
              </td>
            </tr>
            <tr>
              <td><strong>Sarah Jenkins</strong></td>
              <td>Food Donation Drive</td>
              <td><a href="#" class="proof-link"><i data-lucide="file-text"></i> donation_receipt.pdf</a></td>
              <td>2026-07-10</td>
              <td>200 XP</td>
              <td><span class="status-tag status-tag-pending">Pending Review</span></td>
              <td>
                <div class="action-buttons-group">
                  <button class="action-btn-mini btn-approve" title="Approve"><i data-lucide="check"></i></button>
                  <button class="action-btn-mini btn-reject" title="Reject"><i data-lucide="x"></i></button>
                </div>
              </td>
            </tr>
            <tr>
              <td><strong>Jane Doe</strong></td>
              <td>Energy Conservation Workshop</td>
              <td><a href="#" class="proof-link"><i data-lucide="file-text"></i> workshop_certificate.pdf</a></td>
              <td>2026-07-08</td>
              <td>500 XP</td>
              <td><span class="status-tag status-tag-active">Approved</span></td>
              <td><span class="verified-text"><i data-lucide="shield-check"></i> Verified</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style>${getSocialCSS()}</style>
  `;
}

function renderDiversityDashboard() {
  return `
    <div class="grid-3">
      <div class="glass-card stat-box">
        <span class="stat-lbl">Women in Leadership</span>
        <h3>42%</h3>
        <span class="sub-label">Goal: 50% by 2028</span>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Global Demographics</span>
        <h3>12 Nationalities</h3>
        <span class="sub-label">Across 3 regional offices</span>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Inclusion Index Score</span>
        <h3>8.4 / 10</h3>
        <span class="sub-label">From annual survey results</span>
      </div>
    </div>

    <div class="grid-2">
      <div class="view-card">
        <div class="card-header">
          <h3>Gender Distribution</h3>
        </div>
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

      <div class="view-card">
        <div class="card-header">
          <h3>Departmental Diversity Balance</h3>
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
        </div>
      </div>
    </div>

    <style>${getSocialCSS()}</style>
  `;
}

function getSocialCSS() {
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
    .btn-info {
      background-color: var(--accent-info);
    }
    .btn-info:hover {
      background-color: #2563eb;
    }
    .btn-secondary {
      background-color: rgba(255,255,255,0.05);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    .btn-secondary:hover {
      background-color: rgba(255,255,255,0.1);
    }
    .full-width {
      width: 100%;
      justify-content: center;
    }

    /* CSR Card */
    .csr-activity-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .csr-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .points-worth {
      background-color: rgba(59, 130, 246, 0.15);
      color: var(--accent-info);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      border: 1px solid rgba(59, 130, 246, 0.2);
    }
    .csr-title {
      font-family: var(--font-heading);
      font-size: 17px;
      font-weight: 600;
    }
    .csr-desc {
      font-size: 13.5px;
      color: var(--text-secondary);
      line-height: 1.5;
      flex-grow: 1;
    }
    .csr-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-top: 1px solid var(--border-color);
      padding-top: 12px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      color: var(--text-secondary);
    }
    .meta-item i {
      width: 14px;
      height: 14px;
      color: var(--text-muted);
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
    .border-info {
      border-color: rgba(59, 130, 246, 0.2);
    }
    .sub-label {
      font-size: 11px;
      color: var(--text-muted);
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

    /* Diversity styles */
    .distribution-chart-mock {
      height: 24px;
      width: 100%;
      background-color: rgba(255,255,255,0.05);
      border-radius: var(--radius-full);
      overflow: hidden;
      display: flex;
      margin-top: 16px;
      margin-bottom: 16px;
    }
    .chart-segment {
      height: 100%;
    }
    .segment-female { background-color: #EC4899; }
    .segment-male { background-color: #3B82F6; }
    .segment-nonbinary { background-color: #8B5CF6; }
    .chart-legend {
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    .legend-item {
      font-size: 12px;
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
    .score-badge {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
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
  `;
}
