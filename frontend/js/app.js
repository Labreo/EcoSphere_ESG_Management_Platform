import { renderDashboard } from './components/dashboard.js';
import { renderEnvironmentalPage } from './components/environmental.js';
import { renderSocialPage } from './components/social.js';
import { renderGovernancePage } from './components/governance.js';
import { renderGamificationPage } from './components/gamification.js';
import { renderReportsPage } from './components/reports.js';
import { renderSettingsPage } from './components/settings.js';
import { isAuthenticated, getStoredUser, logout } from './api/auth.js';
import { login, register } from './api/auth.js';

const routes = {
  'dashboard': renderDashboard,

  'environmental/emission-factors': (container) => renderEnvironmentalPage(container, 'emission-factors'),
  'environmental/product-esg-profiles': (container) => renderEnvironmentalPage(container, 'product-esg-profiles'),
  'environmental/carbon-transactions': (container) => renderEnvironmentalPage(container, 'carbon-transactions'),
  'environmental/goals': (container) => renderEnvironmentalPage(container, 'goals'),

  'social/csr-activities': (container) => renderSocialPage(container, 'csr-activities'),
  'social/employee-participation': (container) => renderSocialPage(container, 'employee-participation'),
  'social/diversity-dashboard': (container) => renderSocialPage(container, 'diversity-dashboard'),
  'social/training-completion': (container) => renderSocialPage(container, 'training-completion'),

  'governance/policies': (container) => renderGovernancePage(container, 'policies'),
  'governance/policy-acknowledgements': (container) => renderGovernancePage(container, 'policy-acknowledgements'),
  'governance/audits': (container) => renderGovernancePage(container, 'audits'),
  'governance/compliance-issues': (container) => renderGovernancePage(container, 'compliance-issues'),

  'gamification/challenges': (container) => renderGamificationPage(container, 'challenges'),
  'gamification/challenge-participation': (container) => renderGamificationPage(container, 'challenge-participation'),
  'gamification/badges': (container) => renderGamificationPage(container, 'badges'),
  'gamification/rewards': (container) => renderGamificationPage(container, 'rewards'),
  'gamification/leaderboard': (container) => renderGamificationPage(container, 'leaderboard'),

  'reports/environmental-report': (container) => renderReportsPage(container, 'environmental-report'),
  'reports/social-report': (container) => renderReportsPage(container, 'social-report'),
  'reports/governance-report': (container) => renderReportsPage(container, 'governance-report'),
  'reports/esg-summary': (container) => renderReportsPage(container, 'esg-summary'),
  'reports/custom-report-builder': (container) => renderReportsPage(container, 'custom-report-builder'),

  'settings/departments': (container) => renderSettingsPage(container, 'departments'),
  'settings/categories': (container) => renderSettingsPage(container, 'categories'),
  'settings/esg-configuration': (container) => renderSettingsPage(container, 'esg-configuration'),
  'settings/notification-settings': (container) => renderSettingsPage(container, 'notification-settings'),
};

const contentViewport = document.getElementById('content-viewport');
const themeToggle = document.getElementById('theme-toggle');

async function handleRouting() {
  let hash = window.location.hash.slice(1).replace(/\/$/, '') || 'dashboard';

  if (hash === 'auth/login' || hash === 'auth/register') {
    renderAuthPage(hash);
    return;
  }

  if (!isAuthenticated()) {
    window.location.hash = '#auth/login';
    return;
  }

  updateUserNav();

  let routeHandler = routes[hash];
  if (!routeHandler) {
    window.location.hash = '#dashboard';
    return;
  }

  const parts = hash.split('/');
  const mainModule = parts[0];
  updateTopNavActiveState(mainModule);

  if (contentViewport) {
    contentViewport.classList.remove('fade-in');
    void contentViewport.offsetWidth;
    contentViewport.innerHTML = loadingHTML();
    contentViewport.classList.add('fade-in');

    try {
      contentViewport.innerHTML = '';
      await routeHandler(contentViewport);
    } catch (err) {
      contentViewport.innerHTML = errorHTML(err.message, () => handleRouting());
    }
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function loadingHTML() {
  return `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading data...</div>
    </div>
  `;
}

function errorHTML(message, retryFn) {
  const retryAttr = retryFn ? ' onclick="location.reload()"' : '';
  return `
    <div class="error-container">
      <i data-lucide="alert-circle"></i>
      <div class="error-title">Something went wrong</div>
      <div class="error-message">${message}</div>
      <button class="error-retry-btn" onclick="location.reload()">Retry</button>
    </div>
  `;
}

function renderAuthPage(pageKey) {
  if (!contentViewport) return;
  contentViewport.innerHTML = '';

  const isLogin = pageKey === 'auth/login';
  const authContainer = document.createElement('div');
  authContainer.className = 'auth-page';
  authContainer.innerHTML = `
    <div class="auth-card">
      <div class="logo-wrapper">
        <div class="logo-icon-lg">🌱</div>
        <h2>EcoSphere</h2>
        <p>ESG Management Platform</p>
      </div>
      <div class="auth-tabs">
        <button class="auth-tab ${isLogin ? 'active' : ''}" data-tab="login">Sign In</button>
        <button class="auth-tab ${!isLogin ? 'active' : ''}" data-tab="register">Register</button>
      </div>
      <div id="auth-form-container">
        ${isLogin ? loginFormHTML() : registerFormHTML()}
      </div>
    </div>
  `;

  contentViewport.appendChild(authContainer);

  authContainer.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      window.location.hash = target === 'login' ? '#auth/login' : '#auth/register';
    });
  });

  const form = authContainer.querySelector('.auth-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = authContainer.querySelector('.auth-error');
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Please wait...';

      try {
        if (isLogin) {
          const email = form.querySelector('#login-email').value;
          const password = form.querySelector('#login-password').value;
          await login(email, password);
        } else {
          const name = form.querySelector('#reg-name').value;
          const email = form.querySelector('#reg-email').value;
          const password = form.querySelector('#reg-password').value;
          const confirm = form.querySelector('#reg-confirm').value;
          if (password !== confirm) {
            throw new Error('Passwords do not match');
          }
          await register(name, email, password);
        }
        window.location.hash = '#dashboard';
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = err.message;
          errorEl.style.display = 'block';
        }
        submitBtn.disabled = false;
        submitBtn.textContent = isLogin ? 'Sign In' : 'Create Account';
      }
    });
  }

  window.lucide?.createIcons();
}

function loginFormHTML() {
  return `
    <form class="auth-form">
      <div id="auth-error" class="auth-error" style="display:none"></div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" id="login-email" placeholder="admin@ecosphere.com" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="login-password" placeholder="Enter password" required />
      </div>
      <button type="submit" class="btn-auth">Sign In</button>
      <p style="text-align:center;color:var(--text-muted);font-size:12px;margin-top:8px;">
        Demo: admin@ecosphere.com / admin123
      </p>
    </form>
  `;
}

function registerFormHTML() {
  return `
    <form class="auth-form">
      <div id="auth-error" class="auth-error" style="display:none"></div>
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" id="reg-name" placeholder="Your name" required />
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" id="reg-email" placeholder="you@company.com" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="reg-password" placeholder="Create password" required />
      </div>
      <div class="form-group">
        <label>Confirm Password</label>
        <input type="password" id="reg-confirm" placeholder="Confirm password" required />
      </div>
      <button type="submit" class="btn-auth">Create Account</button>
    </form>
  `;
}

function updateTopNavActiveState(mainModule) {
  const topLinks = document.querySelectorAll('.nav-link-horizontal');
  topLinks.forEach(link => link.classList.remove('active'));

  const activeTopLink = document.getElementById(`link-${mainModule}`);
  if (activeTopLink) {
    activeTopLink.classList.add('active');
  }
}

function updateUserNav() {
  const user = getStoredUser();
  const navBar = document.querySelector('.horizontal-nav');
  if (!navBar) return;

  let userSection = navBar.querySelector('.nav-user-section');
  if (!userSection) {
    userSection = document.createElement('div');
    userSection.className = 'nav-user-section';
    navBar.appendChild(userSection);
  }

  if (user) {
    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
    userSection.innerHTML = `
      <span class="nav-user-avatar" title="${user.name}">${initial}</span>
      <span class="nav-user-name">${user.name}</span>
      <button class="nav-logout-btn" id="logout-btn">Logout</button>
    `;

    const logoutBtn = userSection.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        logout();
        window.location.hash = '#auth/login';
      });
    }
  } else {
    userSection.innerHTML = '';
  }
}

function initializeApp() {
  window.addEventListener('hashchange', handleRouting);

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

  handleRouting();
}

function updateThemeIcon(theme) {
  if (!themeToggle) return;
  themeToggle.innerHTML = theme === 'light' ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
  window.lucide?.createIcons();
}

document.addEventListener('DOMContentLoaded', initializeApp);
