/**
 * EcoSphere Environmental Module View Component
 */

export function renderEnvironmentalPage(container, pageKey) {
  let contentHtml = '';

  if (pageKey === 'emission-factors') {
    contentHtml = renderEmissionFactors();
  } else if (pageKey === 'product-esg-profiles') {
    contentHtml = renderProductESGProfiles();
  } else if (pageKey === 'carbon-transactions') {
    contentHtml = renderCarbonTransactions();
  } else if (pageKey === 'goals') {
    contentHtml = renderEnvironmentalGoals();
  }

  container.innerHTML = `
    <div class="view-container">
      <div class="view-header">
        <h1 class="view-title">${getEnvironmentalTitle(pageKey)}</h1>
        <p class="view-description">${getEnvironmentalDesc(pageKey)}</p>
      </div>
      ${contentHtml}
    </div>
  `;
}

function getEnvironmentalTitle(key) {
  switch (key) {
    case 'emission-factors': return 'Emission Factors';
    case 'product-esg-profiles': return 'Product ESG Profiles';
    case 'carbon-transactions': return 'Carbon Transactions';
    case 'goals': return 'Environmental Goals';
    default: return 'Environmental';
  }
}

function getEnvironmentalDesc(key) {
  switch (key) {
    case 'emission-factors': return 'Manage the CO2e calculation coefficients for different energy, transport, and waste categories.';
    case 'product-esg-profiles': return 'Review carbon footprint metrics, recyclability scores, and lifecycle details for your product catalog.';
    case 'carbon-transactions': return 'Log operational events or configure automated ERP transaction parsing to record carbon emissions.';
    case 'goals': return 'Track progress towards organizational carbon offset, energy reduction, and sustainability targets.';
    default: return 'Configure and manage your organization\'s environmental footprint metrics.';
  }
}

// ----------------------------------------------------
// Page Renders
// ----------------------------------------------------

function renderEmissionFactors() {
  return `
    <div class="grid-3">
      <div class="glass-card stat-box border-success">
        <span class="stat-lbl">Active Factors</span>
        <h3>18</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Default System Factors</span>
        <h3>12</h3>
      </div>
      <div class="glass-card stat-box">
        <span class="stat-lbl">Last Modified</span>
        <h3>July 10, 2026</h3>
      </div>
    </div>

    <div class="view-card">
      <div class="table-actions">
        <input type="text" class="table-search" placeholder="Search emission factors..." />
        <button class="btn btn-success"><i data-lucide="plus"></i> Add Factor</button>
      </div>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Fuel/Activity</th>
              <th>Category</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Source</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Grid Electricity</strong></td>
              <td>Scope 2 (Indirect)</td>
              <td>0.385</td>
              <td>kg CO2e / kWh</td>
              <td>DEFRA 2025</td>
              <td><span class="status-tag status-tag-active">Active</span></td>
              <td><button class="icon-btn"><i data-lucide="edit-3"></i></button></td>
            </tr>
            <tr>
              <td><strong>Diesel (Mobile Burn)</strong></td>
              <td>Scope 1 (Direct)</td>
              <td>2.687</td>
              <td>kg CO2e / Litre</td>
              <td>EPA 2024</td>
              <td><span class="status-tag status-tag-active">Active</span></td>
              <td><button class="icon-btn"><i data-lucide="edit-3"></i></button></td>
            </tr>
            <tr>
              <td><strong>Natural Gas</strong></td>
              <td>Scope 1 (Direct)</td>
              <td>2.021</td>
              <td>kg CO2e / m³</td>
              <td>DEFRA 2025</td>
              <td><span class="status-tag status-tag-active">Active</span></td>
              <td><button class="icon-btn"><i data-lucide="edit-3"></i></button></td>
            </tr>
            <tr>
              <td><strong>Economy Flight (Short Haul)</strong></td>
              <td>Scope 3 (Travel)</td>
              <td>0.158</td>
              <td>kg CO2e / km-pax</td>
              <td>IPCC Tier 1</td>
              <td><span class="status-tag status-tag-active">Active</span></td>
              <td><button class="icon-btn"><i data-lucide="edit-3"></i></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style>${getEnvironmentalCSS()}</style>
  `;
}

function renderProductESGProfiles() {
  return `
    <div class="table-actions">
      <div class="filters-row">
        <select class="filter-dropdown">
          <option>All Product Classes</option>
          <option>Electronics</option>
          <option>Packaging</option>
          <option>Hardware</option>
        </select>
      </div>
      <button class="btn btn-success"><i data-lucide="plus"></i> Add Profile</button>
    </div>

    <div class="grid-3">
      <div class="glass-card product-card">
        <div class="product-header">
          <div class="product-meta">
            <span class="prod-sku">SKU-9902-EL</span>
            <h4>EcoCharger Max</h4>
          </div>
          <span class="score-badge score-a">A</span>
        </div>
        <div class="product-stats">
          <div class="p-stat">
            <span class="p-lbl">Carbon Footprint</span>
            <span class="p-val">1.25 kg CO2e</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">Recyclability</span>
            <span class="p-val">94%</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">CSR Contrib.</span>
            <span class="p-val">5 XP / Sale</span>
          </div>
        </div>
      </div>

      <div class="glass-card product-card">
        <div class="product-header">
          <div class="product-meta">
            <span class="prod-sku">SKU-4819-PK</span>
            <h4>BioSleeve Case 13"</h4>
          </div>
          <span class="score-badge score-a">A</span>
        </div>
        <div class="product-stats">
          <div class="p-stat">
            <span class="p-lbl">Carbon Footprint</span>
            <span class="p-val">0.42 kg CO2e</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">Recyclability</span>
            <span class="p-val">100%</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">CSR Contrib.</span>
            <span class="p-val">2 XP / Sale</span>
          </div>
        </div>
      </div>

      <div class="glass-card product-card">
        <div class="product-header">
          <div class="product-meta">
            <span class="prod-sku">SKU-2051-HW</span>
            <h4>DeskOrganizer Pro</h4>
          </div>
          <span class="score-badge score-b">B</span>
        </div>
        <div class="product-stats">
          <div class="p-stat">
            <span class="p-lbl">Carbon Footprint</span>
            <span class="p-val">3.88 kg CO2e</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">Recyclability</span>
            <span class="p-val">78%</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">CSR Contrib.</span>
            <span class="p-val">8 XP / Sale</span>
          </div>
        </div>
      </div>
    </div>

    <style>${getEnvironmentalCSS()}</style>
  `;
}

function renderCarbonTransactions() {
  return `
    <div class="grid-3">
      <div class="glass-card log-form-wrapper" style="grid-column: span 1;">
        <h3 class="form-title">Log Transaction</h3>
        <form class="action-form">
          <div class="form-group">
            <label>Department</label>
            <select class="form-input">
              <option>Logistics HQ</option>
              <option>Manufacturing Unit 1</option>
              <option>Sales Operations</option>
            </select>
          </div>
          <div class="form-group">
            <label>Emission Factor</label>
            <select class="form-input">
              <option>Grid Electricity (DEFRA 2025)</option>
              <option>Diesel Fuel (EPA 2024)</option>
              <option>Natural Gas (DEFRA 2025)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Activity Value</label>
            <div class="input-unit-group">
              <input type="number" class="form-input" placeholder="Value..." />
              <span class="input-unit-lbl">kWh</span>
            </div>
          </div>
          <button type="button" class="btn btn-success full-width">Calculate & Log</button>
        </form>
      </div>

      <div class="view-card" style="grid-column: span 2;">
        <div class="card-header">
          <h3>Calculated Emissions Registry</h3>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Dept</th>
                <th>Source</th>
                <th>Qty</th>
                <th>Calculated (tCO2e)</th>
                <th>Origin</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2026-07-12</td>
                <td>Logistics HQ</td>
                <td>Electricity</td>
                <td>10,930 kWh</td>
                <td><strong>4.21</strong></td>
                <td><span class="origin-tag auto-tag">ERP (Auto)</span></td>
              </tr>
              <tr>
                <td>2026-07-11</td>
                <td>Sales Ops</td>
                <td>Fleet Diesel</td>
                <td>688 Litres</td>
                <td><strong>1.85</strong></td>
                <td><span class="origin-tag auto-tag">ERP (Auto)</span></td>
              </tr>
              <tr>
                <td>2026-07-10</td>
                <td>Admin HQ</td>
                <td>Business Travel</td>
                <td>5,820 km</td>
                <td><strong>0.92</strong></td>
                <td><span class="origin-tag manual-tag">Manual Entry</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <style>${getEnvironmentalCSS()}</style>
  `;
}

function renderEnvironmentalGoals() {
  return `
    <div class="grid-2">
      <div class="glass-card goal-progress-card">
        <div class="goal-header">
          <div class="goal-main-info">
            <span class="goal-type">Direct Reduction</span>
            <h4>Reduce Scope 1 Emissions by 20%</h4>
          </div>
          <span class="goal-deadline">Deadline: Dec 31, 2026</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-track">
            <div class="progress-fill env-fill" style="width: 65%;"></div>
          </div>
          <div class="progress-labels">
            <span>65% Achieved</span>
            <span>Target: 1,500 tCO2e</span>
          </div>
        </div>
      </div>

      <div class="glass-card goal-progress-card">
        <div class="goal-header">
          <div class="goal-main-info">
            <span class="goal-type">Renewables</span>
            <h4>Transition HQ to 100% Solar Energy</h4>
          </div>
          <span class="goal-deadline">Deadline: Sep 30, 2026</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-track">
            <div class="progress-fill env-fill" style="width: 85%;"></div>
          </div>
          <div class="progress-labels">
            <span>85% Achieved</span>
            <span>Target: 100 kW Panel Install</span>
          </div>
        </div>
      </div>
    </div>

    <style>${getEnvironmentalCSS()}</style>
  `;
}

function getEnvironmentalCSS() {
  return `
    /* Stat boxes */
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
    .border-success {
      border-color: rgba(16, 185, 129, 0.2);
    }

    /* Actions and Table */
    .table-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
      margin-top: 8px;
    }
    .table-search {
      flex: 1;
      max-width: 350px;
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 16px;
      color: var(--text-primary);
      font-size: 14px;
    }
    .table-search:focus {
      outline: none;
      border-color: var(--accent-success);
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
    .btn-success {
      background-color: var(--accent-success);
    }
    .btn-success:hover {
      background-color: #0d9488;
    }
    .full-width {
      width: 100%;
      justify-content: center;
    }
    
    .table-wrapper {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
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
      letter-spacing: 0.5px;
    }
    .icon-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
    }
    .icon-btn:hover {
      color: var(--text-primary);
    }
    .icon-btn i {
      width: 16px;
      height: 16px;
    }

    /* Product card style */
    .product-card {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .prod-sku {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
    }
    .product-header h4 {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 600;
      margin-top: 2px;
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
    .product-stats {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .p-stat {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
    }
    .p-lbl { color: var(--text-secondary); }
    .p-val { font-weight: 600; }

    /* Carbon logs styles */
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
      border-color: var(--accent-success);
    }
    .input-unit-group {
      display: flex;
      position: relative;
    }
    .input-unit-lbl {
      position: absolute;
      right: 12px;
      top: 10px;
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
    }
    .origin-tag {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .auto-tag {
      background-color: rgba(59, 130, 246, 0.1);
      color: var(--accent-info);
    }
    .manual-tag {
      background-color: rgba(255,255,255,0.05);
      color: var(--text-secondary);
    }

    /* Goals styles */
    .goal-progress-card {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .goal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .goal-type {
      font-size: 11px;
      color: var(--accent-success);
      font-weight: 700;
      text-transform: uppercase;
    }
    .goal-header h4 {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 600;
      margin-top: 4px;
    }
    .goal-deadline {
      font-size: 12px;
      color: var(--text-muted);
      white-space: nowrap;
    }
    .progress-bar-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
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
    .env-fill {
      background: linear-gradient(90deg, #10B981, #059669);
    }
    .progress-labels {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }
  `;
}
