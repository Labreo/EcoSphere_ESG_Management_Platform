/**
 * EcoSphere Environmental Module View Component - Unified, Interactive & Top-Nav Layout
 */

import * as api from '../api/environmental.js';
import { renderLoading } from '../api/toast.js';

const MOCK_FACTORS = [
  { id: '1', activity: 'Grid Electricity', category: 'Active', value: 0.385, unit: 'kg CO2e / kWh', source: 'EPA 2025', status: 'Active' },
  { id: '2', activity: 'Diesel (Mobile Burn)', category: 'Active', value: 2.687, unit: 'kg CO2e / Litre', source: 'EPA 2025', status: 'Active' },
  { id: '3', activity: 'Natural Gas', category: 'Active', value: 2.021, unit: 'kg CO2e / m³', source: 'EPA 2025', status: 'Active' },
  { id: '4', activity: 'Economy Flight (Short Haul)', category: 'Active', value: 0.158, unit: 'kg CO2e / km', source: 'DEFRA 2025', status: 'Active' },
  { id: '5', activity: 'Company Car (Petrol)', category: 'Active', value: 0.210, unit: 'kg CO2e / km', source: 'EPA 2025', status: 'Active' },
  { id: '6', activity: 'Waste Disposal (Landfill)', category: 'Active', value: 0.590, unit: 'kg CO2e / kg', source: 'DEFRA 2025', status: 'Active' },
];
const MOCK_PRODUCTS = [
  { id: '1', sku: 'SKU-9902-EL', name: 'EcoCharger Max', class: 'Electronics', carbon: 1.25, recyclability: 94, xp: 9 },
  { id: '2', sku: 'SKU-4819-PK', name: 'BioSleeve Case 13"', class: 'Packaging', carbon: 0.42, recyclability: 100, xp: 10 },
  { id: '3', sku: 'SKU-2051-HW', name: 'DeskOrganizer Pro', class: 'Hardware', carbon: 3.88, recyclability: 78, xp: 8 },
  { id: '4', sku: 'SKU-6712-PK', name: 'Compostable Mailer Pack', class: 'Packaging', carbon: 0.18, recyclability: 100, xp: 10 },
  { id: '5', sku: 'SKU-3345-EL', name: 'Solar Desk Lamp', class: 'Electronics', carbon: 2.10, recyclability: 82, xp: 8 },
];
const MOCK_GOALS = [
  { id: '1', name: 'Reduce Fleet Emissions', department: 'Logistics', target: 500, current: 390, deadline: '2026-12-31', status: 'Active' },
  { id: '2', name: 'Cut Packaging Waste', department: 'Manufacturing', target: 120, current: 98, deadline: '2026-09-30', status: 'Active' },
  { id: '3', name: 'Office Energy Cut', department: 'Corporate', target: 80, current: 80, deadline: '2026-06-30', status: 'Completed' },
  { id: '4', name: 'Warehouse Solar Initiative', department: 'Logistics', target: 200, current: 145, deadline: '2026-11-30', status: 'Active' },
  { id: '5', name: 'R&D Lab Efficiency', department: 'R&D', target: 50, current: 35, deadline: '2026-08-15', status: 'Active' },
];
const MOCK_TRANSACTIONS = [
  { id: '1', date: '2026-05-15', dept: 'Corporate HQ', source: 'Grid Electricity', qty: '50000', calculated: 19.25, origin: 'Auto-Calculated' },
  { id: '2', date: '2026-05-20', dept: 'Manufacturing Unit 1', source: 'Grid Electricity', qty: '120000', calculated: 46.20, origin: 'Auto-Calculated' },
  { id: '3', date: '2026-06-05', dept: 'Logistics HQ', source: 'Diesel (Mobile Burn)', qty: '4500', calculated: 12.09, origin: 'Auto-Calculated' },
  { id: '4', date: '2026-06-10', dept: 'Manufacturing Unit 1', source: 'Natural Gas', qty: '8000', calculated: 16.17, origin: 'Auto-Calculated' },
  { id: '5', date: '2026-06-12', dept: 'Corporate HQ', source: 'Economy Flight (Short Haul)', qty: '12000', calculated: 1.90, origin: 'Auto-Calculated' },
  { id: '6', date: '2026-06-18', dept: 'R&D Division', source: 'Grid Electricity', qty: '35000', calculated: 13.48, origin: 'Manual Entry' },
  { id: '7', date: '2026-06-22', dept: 'Logistics HQ', source: 'Diesel (Mobile Burn)', qty: '2800', calculated: 7.52, origin: 'Auto-Calculated' },
  { id: '8', date: '2026-07-01', dept: 'Sales Operations', source: 'Grid Electricity', qty: '22000', calculated: 8.47, origin: 'Manual Entry' },
  { id: '9', date: '2026-07-05', dept: 'Corporate HQ', source: 'Natural Gas', qty: '5500', calculated: 11.12, origin: 'Auto-Calculated' },
  { id: '10', date: '2026-07-08', dept: 'R&D Division', source: 'Economy Flight (Short Haul)', qty: '8500', calculated: 1.34, origin: 'Manual Entry' },
];

let emissionFactors = [];
let productProfiles = [];
let carbonTransactions = [];
let environmentalGoals = [];
let selectedGoalId = null;
let goalsSearchQuery = '';
let factorsSearchQuery = '';
let productsFilterClass = 'All Product Classes';

/**
 * Main render function entry point
 */
export async function renderEnvironmentalPage(container, pageKey) {
  selectedGoalId = null;
  renderLoading(container);

  try {
    const [factors, products, goals] = await Promise.all([
      api.getFactors(),
      api.getProducts(),
      api.getGoals(),
    ]);
    emissionFactors = factors;
    productProfiles = products;
    environmentalGoals = goals;
    carbonTransactions = MOCK_TRANSACTIONS;
  } catch (err) {
    emissionFactors = MOCK_FACTORS;
    productProfiles = MOCK_PRODUCTS;
    environmentalGoals = MOCK_GOALS;
    carbonTransactions = MOCK_TRANSACTIONS;
  }

  const envPageTitles = { 'emission-factors': 'Emission Factors', 'product-esg-profiles': 'Product ESG Profiles', 'carbon-transactions': 'Carbon Transactions', 'goals': 'Environmental Goals' };

  container.innerHTML = `
    <div class="view-container">
      
      <div class="breadcrumb">
        <a href="#dashboard">Dashboard</a>
        <span class="breadcrumb-sep">›</span>
        <a href="#environmental/goals">Environmental</a>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">${envPageTitles[pageKey] || 'Environmental'}</span>
      </div>

      <!-- Sub Navigation Tabs -->
      <div class="sub-nav-tabs env">
        <a href="#environmental/emission-factors" class="sub-nav-tab ${pageKey === 'emission-factors' ? 'active' : ''}">
          <i data-lucide="droplets"></i> Emission Factors
        </a>
        <a href="#environmental/product-esg-profiles" class="sub-nav-tab ${pageKey === 'product-esg-profiles' ? 'active' : ''}">
          <i data-lucide="package"></i> Product ESG Profiles
        </a>
        <a href="#environmental/carbon-transactions" class="sub-nav-tab ${pageKey === 'carbon-transactions' ? 'active' : ''}">
          <i data-lucide="arrow-left-right"></i> Carbon Transactions
        </a>
        <a href="#environmental/goals" class="sub-nav-tab ${pageKey === 'goals' ? 'active' : ''}">
          <i data-lucide="target"></i> Environmental Goals
        </a>
      </div>

      <!-- Active Section Panel -->
      <div id="environmental-section-panel">
        ${renderActiveSectionPanel(pageKey)}
      </div>
    </div>

    <style>${getEnvironmentalCSS()}</style>
  `;

  // Bind events for the currently active tab
  bindActivePanelEvents(container, pageKey);

  // Load Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Renders HTML for active tab (KPI Summaries removed completely as requested)
 */
function renderActiveSectionPanel(key) {
  switch (key) {
    case 'emission-factors':
      return renderEmissionFactors();
    case 'product-esg-profiles':
      return renderProductESGProfiles();
    case 'carbon-transactions':
      return renderCarbonTransactions();
    case 'goals':
      return renderEnvironmentalGoals();
    default:
      return `<div class="glass-card">Select a sub-section from the navigation tabs above.</div>`;
  }
}

// ---------------------------------------------------------------------
// 1. EMISSION FACTORS VIEW
// ---------------------------------------------------------------------
function renderEmissionFactors() {
  const factorRows = emissionFactors.map(f => `
    <tr>
      <td><strong class="factor-activity">${f.activity}</strong></td>
      <td class="factor-category">${f.category}</td>
      <td><strong>${f.value.toFixed(3)}</strong></td>
      <td class="text-secondary">${f.unit}</td>
      <td><span class="source-tag">${f.source}</span></td>
      <td><span class="status-tag ${f.status === 'Active' ? 'status-tag-active' : 'status-tag-pending'}">${f.status}</span></td>
      <td>
        <button class="icon-btn edit-factor-row-btn" data-id="${f.id}" title="Edit Factor">
          <i data-lucide="edit-3"></i>
        </button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="view-card" style="margin-top: 0; padding: 0; background: transparent; border: none; box-shadow: none;">
      <div class="table-actions">
        <div class="search-input-wrapper">
          <i data-lucide="search" class="search-icon"></i>
          <input type="text" id="factors-search" class="table-search" placeholder="Search emission factors..." />
        </div>
        <button class="btn btn-success" id="btn-add-factor"><i data-lucide="plus"></i> Add Factor</button>
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
          <tbody class="factors-table-body">
            ${factorRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------
// 2. PRODUCT ESG PROFILES VIEW
// ---------------------------------------------------------------------
function renderProductESGProfiles() {
  return `
    <div class="table-actions" style="margin-bottom: 20px;">
      <div class="filters-row">
        <select class="filter-dropdown" id="prod-class-filter">
          <option value="All Product Classes">All Product Classes</option>
          <option value="Electronics">Electronics</option>
          <option value="Packaging">Packaging</option>
          <option value="Hardware">Hardware</option>
        </select>
      </div>
      <button class="btn btn-success" id="btn-add-product-profile"><i data-lucide="plus"></i> Add Profile</button>
    </div>

    <div class="grid-3" id="products-cards-grid">
      ${renderProductCardsHTML()}
    </div>
  `;
}

function renderProductCardsHTML() {
  return productProfiles.map(p => {
    const score = getProductScore(p.recyclability);
    return `
      <div class="glass-card product-card" data-class="${p.class}">
        <div class="product-header">
          <div class="product-meta">
            <span class="prod-sku">${p.sku}</span>
            <h4>${p.name}</h4>
          </div>
          <span class="score-badge score-${score.toLowerCase()}">${score}</span>
        </div>
        <div class="product-stats">
          <div class="p-stat">
            <span class="p-lbl">Carbon Footprint</span>
            <span class="p-val">${p.carbon.toFixed(2)} kg CO2e</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">Recyclability</span>
            <span class="p-val">${p.recyclability}%</span>
          </div>
          <div class="p-stat">
            <span class="p-lbl">CSR Contrib.</span>
            <span class="p-val">${p.xp} XP / Sale</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ---------------------------------------------------------------------
// 3. CARBON TRANSACTIONS VIEW
// ---------------------------------------------------------------------
function renderCarbonTransactions() {
  const txRows = carbonTransactions.map(t => `
    <tr>
      <td>${t.date}</td>
      <td><strong>${t.dept}</strong></td>
      <td>${t.source}</td>
      <td>${t.qty}</td>
      <td><strong>${t.calculated.toFixed(2)}</strong></td>
      <td><span class="origin-tag ${t.origin.includes('Auto') ? 'auto-tag' : 'manual-tag'}">${t.origin}</span></td>
    </tr>
  `).join('');

  const factorOptions = emissionFactors.map(f => `
    <option value="${f.id}">${f.activity} (${f.source})</option>
  `).join('');

  return `
    <div class="grid-3" style="grid-template-columns: 1fr 2fr; gap: 24px; margin-top: 0;">
      <!-- Log Form (Left) -->
      <div class="glass-card log-form-wrapper" style="height: fit-content;">
        <h3 class="form-title" style="display: flex; align-items: center; gap: 8px;">
          <i data-lucide="plus-circle" style="color: var(--accent-success); width: 20px; height: 20px;"></i> Log Transaction
        </h3>
        <form class="action-form" id="tx-log-form">
          <div class="form-group">
            <label for="tx-dept-select">Department</label>
            <select class="form-input" id="tx-dept-select" required>
              <option value="Logistics HQ">Logistics HQ</option>
              <option value="Manufacturing Unit 1">Manufacturing Unit 1</option>
              <option value="Sales Operations">Sales Operations</option>
              <option value="Admin HQ">Admin HQ</option>
              <option value="R&D Division">R&D Division</option>
            </select>
          </div>
          <div class="form-group">
            <label for="tx-factor-select">Emission Factor</label>
            <select class="form-input" id="tx-factor-select" required>
              ${factorOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="tx-qty-input">Activity Value</label>
            <div class="input-unit-group">
              <input type="number" class="form-input" id="tx-qty-input" placeholder="e.g. 1000" step="any" min="0.01" required />
              <span class="input-unit-lbl" id="tx-unit-label">kWh</span>
            </div>
          </div>
          <button type="submit" class="btn btn-success full-width" style="margin-top: 8px;">
            <i data-lucide="sparkles"></i> Calculate & Log
          </button>
        </form>
      </div>

      <!-- calculated emissions registry table (Right) -->
      <div class="view-card" style="margin: 0; padding: 0; background: transparent; border: none; box-shadow: none;">
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
              ${txRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------
// 4. ENVIRONMENTAL GOALS VIEW (Active in Mockup)
// ---------------------------------------------------------------------
function renderEnvironmentalGoals() {
  const goalRows = environmentalGoals.map(g => {
    const progress = Math.min(100, Math.max(0, Math.round((g.current / g.target) * 100)));
    const isSelected = selectedGoalId === g.id;

    // Status outlines mapping strictly to user request:
    // Green outlines for Active / On Track, Blue outline for Completed
    let statusClass = 'status-badge-outline-green';
    if (g.status === 'Completed') statusClass = 'status-badge-outline-blue';

    return `
      <tr class="goal-row ${isSelected ? 'selected' : ''}" data-id="${g.id}">
        <td><strong class="goal-name">${g.name}</strong></td>
        <td class="goal-dept">${g.department}</td>
        <td><strong>${g.target} t</strong></td>
        <td class="text-secondary">${g.current} t</td>
        <td>
          <div class="progress-col">
            <div class="progress-bar-mini">
              <div class="progress-fill-mini" style="width: ${progress}%;"></div>
            </div>
            <span class="progress-pct">${progress}%</span>
          </div>
        </td>
        <td><span class="text-muted">${g.deadline}</span></td>
        <td><span class="status-badge ${statusClass}">${g.status}</span></td>
      </tr>
    `;
  }).join('');

  return `
    <!-- Main goals ledger -->
    <div class="view-card" style="margin-top: 0; padding: 0; background: transparent; border: none; box-shadow: none;">
      
      <!-- Action Row & Search Input -->
      <div class="table-actions" style="margin-bottom: 20px;">
        <div style="display: flex; gap: 8px; align-items: center; position: relative;">
          <button class="btn btn-success" id="btn-new-goal">
             + New Goal
          </button>
          
          <button class="btn btn-orange disabled" id="btn-edit-goal" disabled>
             Edit
          </button>
          
          <button class="btn btn-red disabled" id="btn-delete-goal" disabled>
             Delete
          </button>
          
          <div class="dropdown-wrapper">
            <button class="btn btn-gray" id="btn-export-goal" style="display: flex; align-items: center; gap: 4px;">
              Export <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>
            </button>
            <div class="dropdown-menu" id="export-menu">
              <div class="export-option" data-format="CSV">CSV Format</div>
              <div class="export-option" data-format="PDF">PDF Report</div>
              <div class="export-option" data-format="Excel">Excel Worksheet</div>
            </div>
          </div>
        </div>

        <div class="search-input-wrapper">
          <i data-lucide="search" class="search-icon"></i>
          <input type="text" id="goals-search" class="table-search" placeholder="Search goals..." />
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Target CO₂</th>
              <th>Current CO₂</th>
              <th>Progress</th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody class="goals-table-body">
            ${goalRows}
          </tbody>
        </table>
      </div>

      <div class="goals-footer-caption">
        Row actions: <i data-lucide="eye" class="footer-icon"></i> View <i data-lucide="edit-3" class="footer-icon"></i> Edit <i data-lucide="trash-2" class="footer-icon"></i> Delete &bull; Carbon Transactions auto-generated from Purchase/Manufacturing/Fleet/Expenses
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------
// EVENT BINDINGS
// ---------------------------------------------------------------------
function bindActivePanelEvents(container, pageKey) {
  if (pageKey === 'emission-factors') {
    bindEmissionFactorsEvents(container);
  } else if (pageKey === 'product-esg-profiles') {
    bindProductESGProfilesEvents(container);
  } else if (pageKey === 'carbon-transactions') {
    bindCarbonTransactionsEvents(container);
  } else if (pageKey === 'goals') {
    bindGoalsEvents(container);
  }
}

/**
 * 1. Emission Factors Events
 */
function bindEmissionFactorsEvents(container) {
  const searchInput = container.querySelector('#factors-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      factorsSearchQuery = e.target.value.toLowerCase();
      const rows = container.querySelectorAll('.factors-table-body tr');
      rows.forEach(row => {
        const activity = row.querySelector('.factor-activity').textContent.toLowerCase();
        const category = row.querySelector('.factor-category').textContent.toLowerCase();
        if (activity.includes(factorsSearchQuery) || category.includes(factorsSearchQuery)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  const editButtons = container.querySelectorAll('.edit-factor-row-btn');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const factor = emissionFactors.find(f => f.id === id);
      if (!factor) return;

      const fieldsHtml = `
        <div class="form-group">
          <label>Activity/Fuel Name</label>
          <input type="text" name="activity" class="form-input" value="${factor.activity}" required />
        </div>
        <div class="form-group">
          <label>Category Scope</label>
          <select name="category" class="form-input" required>
            <option value="Scope 1 (Direct)" ${factor.category.includes('Scope 1') ? 'selected' : ''}>Scope 1 (Direct)</option>
            <option value="Scope 2 (Indirect)" ${factor.category.includes('Scope 2') ? 'selected' : ''}>Scope 2 (Indirect)</option>
            <option value="Scope 3 (Travel)" ${factor.category.includes('Travel') ? 'selected' : ''}>Scope 3 (Travel)</option>
            <option value="Scope 3 (Supply Chain)" ${factor.category.includes('Supply Chain') ? 'selected' : ''}>Scope 3 (Supply Chain)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Value (kg CO2e)</label>
          <input type="number" name="value" class="form-input" value="${factor.value}" step="any" required />
        </div>
        <div class="form-group">
          <label>Unit Label</label>
          <input type="text" name="unit" class="form-input" value="${factor.unit}" required />
        </div>
        <div class="form-group">
          <label>Source Reference</label>
          <input type="text" name="source" class="form-input" value="${factor.source}" required />
        </div>
        <div class="form-group">
          <label>Status</label>
          <select name="status" class="form-input" required>
            <option value="Active" ${factor.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${factor.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      `;

      openModal('Edit Emission Factor', fieldsHtml, async (data) => {
        try {
          await api.updateFactor(id, {
            activity: data.activity,
            value: data.value,
            unit: data.unit,
            source: data.source,
            status: data.status,
          });
          showToast('Emission factor updated successfully.', 'success');
          renderEnvironmentalPage(container, 'emission-factors');
        } catch (err) {
          showToast('Failed to update factor: ' + err.message, 'error');
        }
      });
    });
  });

  const addBtn = container.querySelector('#btn-add-factor');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const fieldsHtml = `
        <div class="form-group">
          <label>Activity/Fuel Name</label>
          <input type="text" name="activity" class="form-input" placeholder="e.g. Flight travel" required />
        </div>
        <div class="form-group">
          <label>Category Scope</label>
          <select name="category" class="form-input" required>
            <option value="Scope 1 (Direct)">Scope 1 (Direct)</option>
            <option value="Scope 2 (Indirect)">Scope 2 (Indirect)</option>
            <option value="Scope 3 (Travel)">Scope 3 (Travel)</option>
            <option value="Scope 3 (Supply Chain)">Scope 3 (Supply Chain)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Value (kg CO2e)</label>
          <input type="number" name="value" class="form-input" placeholder="e.g. 0.15" step="any" required />
        </div>
        <div class="form-group">
          <label>Unit Label</label>
          <input type="text" name="unit" class="form-input" placeholder="e.g. kg CO2e / km" required />
        </div>
        <div class="form-group">
          <label>Source Reference</label>
          <input type="text" name="source" class="form-input" placeholder="e.g. EPA 2025" required />
        </div>
        <div class="form-group">
          <label>Status</label>
          <select name="status" class="form-input" required>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      `;

      openModal('Add New Emission Factor', fieldsHtml, async (data) => {
        try {
          await api.createFactor({
            activity: data.activity,
            value: data.value,
            unit: data.unit,
            source: data.source,
            status: data.status,
          });
          showToast('New emission factor added successfully.', 'success');
          renderEnvironmentalPage(container, 'emission-factors');
        } catch (err) {
          showToast('Failed to add factor: ' + err.message, 'error');
        }
      });
    });
  }
}

/**
 * 2. Product ESG Profiles Events
 */
function bindProductESGProfilesEvents(container) {
  const filterDropdown = container.querySelector('#prod-class-filter');
  if (filterDropdown) {
    filterDropdown.value = productsFilterClass;
    filterDropdown.addEventListener('change', (e) => {
      productsFilterClass = e.target.value;
      const cards = container.querySelectorAll('.product-card');
      cards.forEach(card => {
        const prodClass = card.getAttribute('data-class');
        if (productsFilterClass === 'All Product Classes' || prodClass === productsFilterClass) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  const addBtn = container.querySelector('#btn-add-product-profile');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const fieldsHtml = `
        <div class="form-group">
          <label>SKU Code</label>
          <input type="text" name="sku" class="form-input" placeholder="e.g. SKU-5021-PK" required />
        </div>
        <div class="form-group">
          <label>Product Name</label>
          <input type="text" name="name" class="form-input" placeholder="e.g. Biodegradable Wrap" required />
        </div>
        <div class="form-group">
          <label>Product Class</label>
          <select name="class" class="form-input" required>
            <option value="Electronics">Electronics</option>
            <option value="Packaging">Packaging</option>
            <option value="Hardware">Hardware</option>
          </select>
        </div>
        <div class="form-group">
          <label>Carbon Footprint (kg CO2e)</label>
          <input type="number" name="carbon" class="form-input" placeholder="e.g. 0.85" step="any" required />
        </div>
        <div class="form-group">
          <label>Recyclability Score (%)</label>
          <input type="number" name="recyclability" class="form-input" placeholder="e.g. 95" min="0" max="100" required />
        </div>
        <div class="form-group">
          <label>Gamified CSR Contribution (XP/sale)</label>
          <input type="number" name="xp" class="form-input" placeholder="e.g. 4" required />
        </div>
      `;

      openModal('Add Product ESG Profile', fieldsHtml, async (data) => {
        try {
          const carbon = parseFloat(data.carbon);
          const recyclability = parseInt(data.recyclability, 10);
          const xp = parseInt(data.xp, 10);
          if (isNaN(carbon) || carbon < 0) {
            showToast('Carbon footprint must be a non-negative number.', 'warning');
            return;
          }
          if (isNaN(recyclability) || recyclability < 0 || recyclability > 100) {
            showToast('Recyclability score must be between 0 and 100.', 'warning');
            return;
          }
          await api.createProduct({
            sku: data.sku,
            name: data.name,
            carbon: carbon,
            recyclability: recyclability,
            xp: xp,
          });
          showToast(`Product Profile for ${data.name} created.`, 'success');
          renderEnvironmentalPage(container, 'product-esg-profiles');
        } catch (err) {
          showToast('Failed to add product: ' + err.message, 'error');
        }
      });
    });
  }
}

/**
 * 3. Carbon Transactions Events
 */
function bindCarbonTransactionsEvents(container) {
  const factorSelect = container.querySelector('#tx-factor-select');
  const unitLabel = container.querySelector('#tx-unit-label');
  if (factorSelect && unitLabel) {
    const updateUnit = () => {
      const val = factorSelect.value;
      const factor = emissionFactors.find(f => f.id === val);
      if (factor) {
        const unitParts = factor.unit.split('/');
        const unitStr = unitParts[1] ? unitParts[1].trim() : 'Qty';
        unitLabel.textContent = unitStr;
      }
    };
    factorSelect.addEventListener('change', updateUnit);
    updateUnit();
  }

  const form = container.querySelector('#tx-log-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dept = container.querySelector('#tx-dept-select').value;
      const factorId = factorSelect.value;
      const qtyRaw = container.querySelector('#tx-qty-input').value;
      const qtyVal = parseFloat(qtyRaw);

      if (!dept) {
        showToast('Please select a department.', 'warning');
        return;
      }
      if (!factorId) {
        showToast('Please select an emission factor.', 'warning');
        return;
      }
      if (isNaN(qtyVal) || qtyVal <= 0) {
        showToast('Please enter a valid positive activity quantity.', 'warning');
        return;
      }
      if (qtyVal > 1e12) {
        showToast('Quantity value is too large.', 'warning');
        return;
      }

      const factor = emissionFactors.find(f => f.id === factorId);
      if (!factor) return;

      try {
        await api.logTransaction({
          source_type: factor.activity,
          source_id: 'manual-' + Date.now(),
          raw_value: qtyVal,
          emission_factor_id: factorId,
          department_id: 1,
        });
        showToast('Transaction logged successfully.', 'success');
        renderEnvironmentalPage(container, 'carbon-transactions');
      } catch (err) {
        showToast('Failed to log transaction: ' + err.message, 'error');
      }
    });
  }
}

/**
 * 4. Environmental Goals Events (Active Mockup Tab)
 */
function bindGoalsEvents(container) {
  const tableRows = container.querySelectorAll('.goals-table-body tr');
  const editBtn = container.querySelector('#btn-edit-goal');
  const deleteBtn = container.querySelector('#btn-delete-goal');

  // Row Selection logic
  tableRows.forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-id');

      if (selectedGoalId === id) {
        selectedGoalId = null;
        row.classList.remove('selected');
      } else {
        selectedGoalId = id;
        tableRows.forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
      }

      updateGoalActionButtons();
    });
  });

  function updateGoalActionButtons() {
    if (selectedGoalId) {
      editBtn.removeAttribute('disabled');
      deleteBtn.removeAttribute('disabled');
      editBtn.classList.remove('disabled');
      deleteBtn.classList.remove('disabled');
    } else {
      editBtn.setAttribute('disabled', 'true');
      deleteBtn.setAttribute('disabled', 'true');
      editBtn.classList.add('disabled');
      deleteBtn.classList.add('disabled');
    }
  }

  // Search input filtering
  const searchInput = container.querySelector('#goals-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      goalsSearchQuery = e.target.value.toLowerCase();
      tableRows.forEach(row => {
        const name = row.querySelector('.goal-name').textContent.toLowerCase();
        const dept = row.querySelector('.goal-dept').textContent.toLowerCase();
        if (name.includes(goalsSearchQuery) || dept.includes(goalsSearchQuery)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // Export Dropdown
  const exportBtn = container.querySelector('#btn-export-goal');
  const exportMenu = container.querySelector('#export-menu');
  if (exportBtn && exportMenu) {
    exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      exportMenu.classList.remove('show');
    });

    exportMenu.querySelectorAll('.export-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const format = option.getAttribute('data-format');
        showToast(`Goal ledger exported successfully as ${format}.`, 'success');
      });
    });
  }

  // + New Goal Action
  const newGoalBtn = container.querySelector('#btn-new-goal');
  if (newGoalBtn) {
    newGoalBtn.addEventListener('click', () => {
      const fieldsHtml = `
        <div class="form-group">
          <label>Goal Target Name</label>
          <input type="text" name="name" class="form-input" placeholder="e.g. Cut office energy consumption" required />
        </div>
        <div class="form-group">
          <label>Responsible Department</label>
          <select name="department" class="form-input" required>
            <option value="Logistics">Logistics</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Corporate">Corporate</option>
            <option value="Sales">Sales</option>
            <option value="R&D">R&D</option>
          </select>
        </div>
        <div class="form-group">
          <label>Target CO2 Emissions Offset/Saving (tonnes)</label>
          <input type="number" name="target" class="form-input" placeholder="e.g. 200" min="1" required />
        </div>
        <div class="form-group">
          <label>Current Offset/Saving (tonnes)</label>
          <input type="number" name="current" class="form-input" placeholder="e.g. 0" min="0" value="0" required />
        </div>
        <div class="form-group">
          <label>Target Deadline Date</label>
          <input type="date" name="deadline" class="form-input" required />
        </div>
        <div class="form-group">
          <label>Goal Status</label>
          <select name="status" class="form-input" required>
            <option value="Active">Active</option>
            <option value="On Track">On Track</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      `;

      openModal('Create Sustainability Goal', fieldsHtml, async (data) => {
        const target = parseInt(data.target, 10);
        const current = parseInt(data.current, 10);
        if (isNaN(target) || target <= 0) {
          showToast('Target must be a positive number.', 'warning');
          return;
        }
        if (isNaN(current) || current < 0) {
          showToast('Current progress must be a non-negative number.', 'warning');
          return;
        }
        if (!data.deadline) {
          showToast('Please select a target deadline date.', 'warning');
          return;
        }
        try {
          await api.createGoal({
            name: data.name,
            target,
            current,
            deadline: data.deadline,
            status: data.status
          });
          showToast(`Created target: ${data.name}`, 'success');
          renderEnvironmentalPage(container, 'goals');
        } catch (err) {
          showToast('Failed to create goal: ' + err.message, 'error');
        }
      });
    });
  }

  // Edit Goal Action
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      if (!selectedGoalId) return;
      const goal = environmentalGoals.find(g => g.id === selectedGoalId);
      if (!goal) return;

      const fieldsHtml = `
        <div class="form-group">
          <label>Goal Target Name</label>
          <input type="text" name="name" class="form-input" value="${goal.name}" required />
        </div>
        <div class="form-group">
          <label>Responsible Department</label>
          <select name="department" class="form-input" required>
            <option value="Logistics" ${goal.department === 'Logistics' ? 'selected' : ''}>Logistics</option>
            <option value="Manufacturing" ${goal.department === 'Manufacturing' ? 'selected' : ''}>Manufacturing</option>
            <option value="Corporate" ${goal.department === 'Corporate' ? 'selected' : ''}>Corporate</option>
            <option value="Sales" ${goal.department === 'Sales' ? 'selected' : ''}>Sales</option>
            <option value="R&D" ${goal.department === 'R&D' ? 'selected' : ''}>R&D</option>
          </select>
        </div>
        <div class="form-group">
          <label>Target CO2 Emissions (tonnes)</label>
          <input type="number" name="target" class="form-input" value="${goal.target}" min="1" required />
        </div>
        <div class="form-group">
          <label>Current Saved Emissions (tonnes)</label>
          <input type="number" name="current" class="form-input" value="${goal.current}" min="0" required />
        </div>
        <div class="form-group">
          <label>Target Deadline Date</label>
          <input type="date" name="deadline" class="form-input" value="${goal.deadline}" required />
        </div>
        <div class="form-group">
          <label>Goal Status</label>
          <select name="status" class="form-input" required>
            <option value="Active" ${goal.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="On Track" ${goal.status === 'On Track' ? 'selected' : ''}>On Track</option>
            <option value="Completed" ${goal.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
      `;

      openModal('Edit Sustainability Goal', fieldsHtml, async (data) => {
        const target = parseInt(data.target, 10);
        const current = parseInt(data.current, 10);
        if (isNaN(target) || target <= 0) {
          showToast('Target must be a positive number.', 'warning');
          return;
        }
        if (isNaN(current) || current < 0) {
          showToast('Current progress must be a non-negative number.', 'warning');
          return;
        }
        if (!data.deadline) {
          showToast('Please select a target deadline date.', 'warning');
          return;
        }
        try {
          await api.updateGoal(selectedGoalId, {
            name: data.name,
            department: data.department,
            target,
            current,
            deadline: data.deadline,
            status: data.status
          });
          showToast('Goal changes saved.', 'success');
          renderEnvironmentalPage(container, 'goals');
        } catch (err) {
          showToast('Failed to update goal: ' + err.message, 'error');
        }
      });
    });
  }

  // Delete Goal Action
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (!selectedGoalId) return;
      try {
        await api.deleteGoal(selectedGoalId);
        selectedGoalId = null;
        showToast('Goal removed from active ledger.', 'warning');
        renderEnvironmentalPage(container, 'goals');
      } catch (err) {
        showToast('Failed to delete goal: ' + err.message, 'error');
      }
    });
  }
}

// ---------------------------------------------------------------------
// MODAL DIALOG POPUP HANDLER
// ---------------------------------------------------------------------
function openModal(title, fieldsHtml, onSave) {
  const existing = document.getElementById('env-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'env-modal-overlay';
  overlay.className = 'modal-backdrop';
  overlay.innerHTML = `
    <div class="modal-content glass-card">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close-btn" id="btn-close-modal" type="button">
          <i data-lucide="x"></i>
        </button>
      </div>
      <form id="env-modal-form" class="action-form">
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${fieldsHtml}
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="submit" class="btn btn-success">Save Changes</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const closeModal = () => {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 150);
  };

  overlay.querySelector('#btn-close-modal').addEventListener('click', closeModal);
  overlay.querySelector('#btn-cancel-modal').addEventListener('click', closeModal);

  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) closeModal();
  });

  overlay.querySelector('#env-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const submitBtn = overlay.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }
    try {
      await onSave(data);
    } catch (err) {
      showToast('Operation failed: ' + err.message, 'error');
    }
    closeModal();
  });
}

// ---------------------------------------------------------------------
// TOAST NOTIFICATIONS POPUP
// ---------------------------------------------------------------------
function showToast(message, type = 'success') {
  const existing = document.querySelectorAll('.env-toast');
  existing.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `env-toast env-toast-${type}`;

  let icon = 'check-circle';
  if (type === 'warning') icon = 'alert-triangle';
  if (type === 'info') icon = 'info';
  if (type === 'error') icon = 'alert-octagon';

  toast.innerHTML = `
    <i data-lucide="${icon}" class="toast-icon"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getProductScore(recyclability) {
  if (recyclability >= 90) return 'A';
  if (recyclability >= 75) return 'B';
  if (recyclability >= 60) return 'C';
  return 'D';
}

// ---------------------------------------------------------------------
// ENVIRONMENTAL CUSTOM CSS RULES (Connected Sub-Tabs, Thick Bars, Outlined Statuses)
// ---------------------------------------------------------------------
function getEnvironmentalCSS() {
  return `
    /* Actions row and search */
    .table-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }
    .search-input-wrapper {
      position: relative;
      flex: 1;
      max-width: 300px;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      width: 16px;
      height: 16px;
      color: var(--text-muted);
    }
    .table-search {
      width: 100%;
      background-color: rgba(0,0,0,0.15);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 14px 10px 36px;
      color: var(--text-primary);
      font-size: 13.5px;
      transition: all var(--transition-fast);
    }
    .table-search:focus {
      outline: none;
      border-color: var(--accent-success);
      background-color: rgba(0,0,0,0.3);
    }

    /* Action Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 16px;
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 13.5px;
      cursor: pointer;
      transition: background-color var(--transition-fast), opacity var(--transition-fast);
      color: white;
    }
    .btn-success {
      background-color: var(--accent-success);
      color: #080B11; /* Contrast label */
    }
    .btn-success:hover:not(.disabled):not(:disabled) {
      background-color: #0d9488;
    }
    .btn-orange {
      background-color: var(--accent-gamification);
    }
    .btn-orange:hover:not(.disabled):not(:disabled) {
      background-color: #d97706;
    }
    .btn-red {
      background-color: #EF4444; /* Coral/pink accent */
    }
    .btn-red:hover:not(.disabled):not(:disabled) {
      background-color: #dc2626;
    }
    .btn-gray {
      background-color: rgba(255, 255, 255, 0.08);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    .btn-gray:hover {
      background-color: rgba(255, 255, 255, 0.12);
    }
    .btn.disabled, .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed !important;
    }
    .full-width {
      width: 100%;
      justify-content: center;
    }
    
    /* Table structure */
    .table-wrapper {
      overflow-x: auto;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .data-table th, .data-table td {
      padding: 14px 18px;
      border-bottom: 1px solid var(--border-color);
      font-size: 14px;
    }
    .data-table th {
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(255, 255, 255, 0.01);
    }
    .data-table tbody tr {
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }
    .data-table tbody tr:hover {
      background-color: rgba(255, 255, 255, 0.02);
    }
    .data-table tbody tr.selected {
      background-color: rgba(16, 185, 129, 0.08) !important;
      border-left: 3px solid var(--accent-success);
    }

    .icon-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      transition: color var(--transition-fast);
    }
    .icon-btn:hover {
      color: var(--text-primary);
    }
    .icon-btn i {
      width: 16px;
      height: 16px;
    }

    /* Outlined Tags & Badges strictly following prompt instructions */
    .source-tag {
      font-size: 11px;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      padding: 2px 6px;
      color: var(--text-secondary);
    }
    .status-tag {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-full);
    }
    .status-tag-active {
      background-color: rgba(16, 185, 129, 0.1);
      color: var(--accent-success);
    }
    .status-tag-pending {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      line-height: 1.2;
    }
    .status-badge-outline-green {
      border: 1.5px solid var(--accent-success) !important;
      color: var(--accent-success) !important;
      background-color: transparent !important;
    }
    .status-badge-outline-blue {
      border: 1.5px solid var(--accent-primary) !important;
      color: var(--accent-primary) !important;
      background-color: transparent !important;
    }

    /* Thick, bold, bright green progress bars */
    .progress-col {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 160px;
    }
    .progress-bar-mini {
      height: 12px; /* Thick bold indicator bar */
      width: 110px;
      background-color: rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-full);
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.03);
    }
    .progress-fill-mini {
      height: 100%;
      border-radius: var(--radius-full);
      background-color: var(--accent-success) !important; /* Thick bright green fill */
    }
    .progress-pct {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--text-primary); /* visual weight matching the bar */
      min-width: 35px;
      text-align: right;
    }

    /* Product card grid layout */
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
    .score-c {
      background-color: rgba(59, 130, 246, 0.15);
      color: var(--accent-info);
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .score-d {
      background-color: rgba(239, 68, 68, 0.15);
      color: var(--accent-danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
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

    /* Carbon logs form styles */
    .form-title {
      font-family: var(--font-heading);
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .action-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
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
      transition: border-color var(--transition-fast);
    }
    .form-input:focus {
      outline: none;
      border-color: var(--accent-success);
    }
    .input-unit-group {
      display: flex;
      position: relative;
      align-items: center;
    }
    .input-unit-lbl {
      position: absolute;
      right: 12px;
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
      pointer-events: none;
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

    /* Small font footer caption strictly formatted */
    .goals-footer-caption {
      margin-top: 14px;
      font-size: 11px;
      color: var(--text-muted);
      text-align: left;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 4px;
    }
    .footer-icon {
      width: 12px;
      height: 12px;
      color: var(--text-muted);
      margin-left: 2px;
      margin-right: 1px;
      display: inline-block;
      vertical-align: text-bottom;
    }

    /* Modal dialog overrides */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: envFadeIn 0.2s ease-out;
    }
    .modal-content {
      width: 450px;
      max-width: 95%;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      background-color: var(--bg-card);
      box-shadow: var(--shadow-lg), 0 0 25px rgba(16, 185, 129, 0.1);
      padding: 24px;
      animation: envScaleIn 0.2s ease-out;
    }
    .modal-content.fade-out {
      animation: envFadeOut 0.15s ease-in forwards;
    }
    .modal-backdrop.fade-out {
      animation: envFadeOut 0.15s ease-in forwards;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 12px;
    }
    .modal-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 700;
    }
    .modal-close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
    }
    .modal-close-btn:hover {
      color: var(--text-primary);
    }
    .modal-close-btn i {
      width: 18px;
      height: 18px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    .btn-secondary {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }
    .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    @keyframes envFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes envScaleIn {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes envFadeOut {
      from { opacity: 1; transform: scale(1); }
      to { opacity: 0; transform: scale(0.96); }
    }

    /* Connected tab dropdown styling */
    .dropdown-wrapper {
      position: relative;
      display: inline-block;
    }
    .dropdown-menu {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 4px;
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 100;
      min-width: 160px;
      overflow: hidden;
      animation: envFadeIn 0.15s ease-out;
    }
    .dropdown-menu.show {
      display: block;
    }
    .export-option {
      padding: 10px 14px;
      font-size: 13px;
      cursor: pointer;
      color: var(--text-secondary);
      transition: background-color var(--transition-fast), color var(--transition-fast);
    }
    .export-option:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }

    /* Filter Class styling */
    .filter-dropdown {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      color: var(--text-primary);
      font-size: 13.5px;
      cursor: pointer;
      outline: none;
    }
    .filter-dropdown:focus {
      border-color: var(--accent-success);
    }

    /* Dynamic notification toasts styling */
    .env-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--bg-card);
      border-left: 4px solid var(--accent-success);
      border-radius: var(--radius-md);
      padding: 12px 20px;
      box-shadow: var(--shadow-lg), 0 0 15px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--text-primary);
      font-size: 13.5px;
      z-index: 2000;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .env-toast.show {
      transform: translateY(0);
      opacity: 1;
    }
    .env-toast-success {
      border-left-color: var(--accent-success);
    }
    .env-toast-info {
      border-left-color: var(--accent-info);
    }
    .env-toast-warning {
      border-left-color: var(--accent-danger);
    }
    .toast-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }
  `;
}
