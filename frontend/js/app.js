/**
 * EcoSphere Frontend Application Router & Controller (Top-Navigation Layout)
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
  
  // Parse main module category from the route path (e.g. "environmental/goals" -> "environmental")
  const parts = hash.split('/');
  const mainModule = parts[0];
  
  // Update Top Navigation Bar active state
  updateTopNavActiveState(mainModule);
  
  // Render views with a fade-in animation transition
  if (contentViewport) {
    contentViewport.classList.remove('fade-in');
    void contentViewport.offsetWidth; // Trigger reflow to restart animation
    contentViewport.classList.add('fade-in');
    
    // Render component view
    contentViewport.innerHTML = '';
    routeHandler(contentViewport);
  }
  
  // Re-initialize any Lucide icons rendered dynamically in components
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Highlight the active link inside the Top Horizontal Navigation
function updateTopNavActiveState(mainModule) {
  const topLinks = document.querySelectorAll('.nav-link-horizontal');
  topLinks.forEach(link => link.classList.remove('active'));
  
  const activeTopLink = document.getElementById(`link-${mainModule}`);
  if (activeTopLink) {
    activeTopLink.classList.add('active');
  }
}

// Initialize Event Listeners
function initializeApp() {
  // Hashchange Router event
  window.addEventListener('hashchange', handleRouting);

  // Dark/Light Theme Toggle (Optional backdrop fallback)
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
