/**
 * EcoSphere Frontend Application Router & Controller
 */

// Import view components
import { renderDashboard } from './components/dashboard.js';
import { renderEnvironmentalPage } from './components/environmental.js';
import { renderSocialPage } from './components/social.js';
import { renderGovernancePage } from './components/governance.js';
import { renderGamificationPage } from './components/gamification.js';
import { renderReportsPage } from './components/reports.js';
import { renderSettingsPage } from './components/settings.js';

// Route registry
const routes = {
  'dashboard': renderDashboard,
  
  // Environmental Pages
  'environmental/emission-factors': (container) => renderEnvironmentalPage(container, 'emission-factors'),
  'environmental/product-esg-profiles': (container) => renderEnvironmentalPage(container, 'product-esg-profiles'),
  'environmental/carbon-transactions': (container) => renderEnvironmentalPage(container, 'carbon-transactions'),
  'environmental/goals': (container) => renderEnvironmentalPage(container, 'goals'),

  // Social Pages
  'social/csr-activities': (container) => renderSocialPage(container, 'csr-activities'),
  'social/employee-participation': (container) => renderSocialPage(container, 'employee-participation'),
  'social/diversity-dashboard': (container) => renderSocialPage(container, 'diversity-dashboard'),

  // Governance Pages
  'governance/policies': (container) => renderGovernancePage(container, 'policies'),
  'governance/policy-acknowledgements': (container) => renderGovernancePage(container, 'policy-acknowledgements'),
  'governance/audits': (container) => renderGovernancePage(container, 'audits'),
  'governance/compliance-issues': (container) => renderGovernancePage(container, 'compliance-issues'),

  // Gamification Pages
  'gamification/challenges': (container) => renderGamificationPage(container, 'challenges'),
  'gamification/challenge-participation': (container) => renderGamificationPage(container, 'challenge-participation'),
  'gamification/badges': (container) => renderGamificationPage(container, 'badges'),
  'gamification/rewards': (container) => renderGamificationPage(container, 'rewards'),
  'gamification/leaderboard': (container) => renderGamificationPage(container, 'leaderboard'),

  // Reports Pages
  'reports/environmental-report': (container) => renderReportsPage(container, 'environmental-report'),
  'reports/social-report': (container) => renderReportsPage(container, 'social-report'),
  'reports/governance-report': (container) => renderReportsPage(container, 'governance-report'),
  'reports/esg-summary': (container) => renderReportsPage(container, 'esg-summary'),
  'reports/custom-report-builder': (container) => renderReportsPage(container, 'custom-report-builder'),

  // Settings Pages
  'settings/departments': (container) => renderSettingsPage(container, 'departments'),
  'settings/categories': (container) => renderSettingsPage(container, 'categories'),
  'settings/esg-configuration': (container) => renderSettingsPage(container, 'esg-configuration'),
  'settings/notification-settings': (container) => renderSettingsPage(container, 'notification-settings')
};

// DOM Elements
const contentViewport = document.getElementById('content-viewport');
const appSidebar = document.getElementById('app-sidebar');
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const mobileNavToggle = document.getElementById('mobile-nav-toggle');
const themeToggle = document.getElementById('theme-toggle');

// Main Routing Handler
function handleRouting() {
  // Get current hash route, clean leading # and trailing slashes
  let hash = window.location.hash.slice(1).replace(/\/$/, '') || 'dashboard';
  
  // Lookup route handler, fallback to dashboard
  let routeHandler = routes[hash];
  if (!routeHandler) {
    window.location.hash = '#dashboard';
    return;
  }
  
  // Parse main module category from the route path (e.g. "environmental/emission-factors" -> "environmental")
  const parts = hash.split('/');
  const mainModule = parts[0];
  
  // Update Top Navigation Bar active state
  updateTopNavActiveState(mainModule);

  // Update Left Sidebar sub-menus visibility based on active category
  updateSidebarMenuVisibility(mainModule);
  
  // Highlight active link inside the Left Sidebar sub-menu
  updateSidebarActiveLink(hash);
  
  // Close mobile sidebar drawer if open
  appSidebar.classList.remove('open');
  
  // Render views with a fade-in animation transition
  contentViewport.classList.remove('fade-in');
  void contentViewport.offsetWidth; // Trigger reflow to restart animation
  contentViewport.classList.add('fade-in');
  
  // Render component view
  contentViewport.innerHTML = '';
  routeHandler(contentViewport);
  
  // Re-initialize any Lucide icons rendered dynamically in components
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Highlight the matching Top Navigation link
function updateTopNavActiveState(mainModule) {
  const topLinks = document.querySelectorAll('.top-nav-link');
  topLinks.forEach(link => link.classList.remove('active'));
  
  const activeTopLink = document.getElementById(`top-link-${mainModule}`);
  if (activeTopLink) {
    activeTopLink.classList.add('active');
  }
}

// Filter the Left Sidebar to only display sub-menu lists matching active module
function updateSidebarMenuVisibility(mainModule) {
  // Hide all sub-menu blocks
  const allSubMenus = document.querySelectorAll('.sidebar-sub-menu');
  allSubMenus.forEach(menu => {
    menu.style.display = 'none';
  });

  // If dashboard, we do not need submenus in sidebar, so sidebar collapses or stays blank
  if (mainModule === 'dashboard') {
    return;
  }

  // Show the matching sub-menu
  const activeSubMenu = document.getElementById(`menu-${mainModule}`);
  if (activeSubMenu) {
    activeSubMenu.style.display = 'flex';
  }
}

// Highlight the active sub-link inside the Left Sidebar
function updateSidebarActiveLink(hash) {
  const sidebarLinks = document.querySelectorAll('.nav-link');
  sidebarLinks.forEach(link => link.classList.remove('active'));
  
  // Check for the link matching the hash
  let linkId = 'link-' + hash;
  if (hash.includes('/')) {
    const parts = hash.split('/');
    linkId = 'link-' + parts[1];
  }
  
  const activeLink = document.getElementById(linkId);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Handle Expand/Collapse Toggle of Left Sidebar
function initializeSidebarToggle() {
  // Read saved collapsed state or default to true (collapsed)
  let isCollapsed = localStorage.getItem('sidebar-collapsed');
  
  // If not set, default to collapsed ('true')
  if (isCollapsed === null) {
    isCollapsed = 'true';
  }

  if (isCollapsed === 'true') {
    appSidebar.classList.add('collapsed');
    updateToggleBtnIcon(true);
  } else {
    appSidebar.classList.remove('collapsed');
    updateToggleBtnIcon(false);
  }

  // Toggle Action listener
  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', () => {
      const nowCollapsed = appSidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebar-collapsed', nowCollapsed ? 'true' : 'false');
      updateToggleBtnIcon(nowCollapsed);
    });
  }
}

// Update the icon inside the sidebar collapse button
function updateToggleBtnIcon(isCollapsed) {
  if (!sidebarToggleBtn) return;
  const icon = sidebarToggleBtn.querySelector('i');
  if (icon && window.lucide) {
    sidebarToggleBtn.innerHTML = isCollapsed 
      ? '<i data-lucide="chevron-right"></i>' 
      : '<i data-lucide="chevron-left"></i>';
    window.lucide.createIcons();
  }
}

// Initialize Event Listeners
function initializeApp() {
  // Initialize Collapsible Sidebar logic
  initializeSidebarToggle();

  // Hashchange Router event
  window.addEventListener('hashchange', handleRouting);
  
  // Mobile Nav Toggle Drawer
  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
      appSidebar.classList.add('open');
    });
  }
  
  // Close sidebar on tapping outside on mobile viewports
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
      if (!appSidebar.contains(e.target) && !mobileNavToggle.contains(e.target) && appSidebar.classList.contains('open')) {
        appSidebar.classList.remove('open');
      }
    }
  });

  // Dark/Light Theme Toggle
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
  
  // Run router once initially
  handleRouting();
}

function updateThemeIcon(theme) {
  if (!themeToggle) return;
  const icon = themeToggle.querySelector('i');
  if (icon && window.lucide) {
    themeToggle.innerHTML = theme === 'light' ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
    window.lucide.createIcons();
  }
}

// Start App when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
