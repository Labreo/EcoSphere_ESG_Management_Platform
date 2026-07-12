import { renderDashboard } from './components/dashboard.js';
import { renderEnvironmentalPage } from './components/environmental.js';
import { renderSocialPage } from './components/social.js';
import { renderGovernancePage } from './components/governance.js';
import { renderGamificationPage } from './components/gamification.js';
import { renderReportsPage } from './components/reports.js';
import { renderSettingsPage } from './components/settings.js';
import { renderChatbotPage } from './components/chatbot.js';
import { renderProfilePage } from './components/profile.js';
import { isAuthenticated, getStoredUser, logout } from './api/auth.js';
import { login, register } from './api/auth.js';
import * as settingsApi from './api/settings.js';

const routes = {
  'dashboard': renderDashboard,
  'chatbot': renderChatbotPage,
  'profile': renderProfilePage,

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

    if (isLogin) {
      form.querySelectorAll('.login-demo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const email = btn.getAttribute('data-email');
          const password = btn.getAttribute('data-password');
          form.querySelector('#login-email').value = email;
          form.querySelector('#login-password').value = password;
        });
      });
    }
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
      <div class="login-demo-section">
        <div class="login-demo-title">Quick Demo Accounts</div>
        <div class="login-demo-grid">
          <button type="button" class="login-demo-btn" data-email="admin@ecosphere.com" data-password="admin123">
            <div class="login-demo-btn-name">System Admin</div>
            <div class="login-demo-btn-role">Full operations control</div>
          </button>
          <button type="button" class="login-demo-btn" data-email="aditi@ecosphere.com" data-password="aditi123">
            <div class="login-demo-btn-name">ESG Manager</div>
            <div class="login-demo-btn-role">Goal and CSR manager</div>
          </button>
          <button type="button" class="login-demo-btn" data-email="employee@ecosphere.com" data-password="employee123">
            <div class="login-demo-btn-name">Employee</div>
            <div class="login-demo-btn-role">Challenges &amp; CSR participation</div>
          </button>
          <button type="button" class="login-demo-btn" data-email="auditor@ecosphere.com" data-password="auditor123">
            <div class="login-demo-btn-name">Auditor</div>
            <div class="login-demo-btn-role">Audit/Compliance management</div>
          </button>
        </div>
      </div>
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

let notificationPollInterval = null;

function getNotificationIcon(type) {
  const icons = {
    'Challenge': 'trophy',
    'CSR': 'heart',
    'Compliance': 'shield-alert',
    'Audit': 'check-square',
    'Policy': 'file-text',
    'Alert': 'bell',
    'Badge': 'award'
  };
  return icons[type] || 'bell';
}

function adjustNotificationBellPlacement() {
  const container = document.getElementById('notification-dropdown-container');
  if (!container) return;

  const isMobile = window.innerWidth <= 1024;

  if (isMobile) {
    const header = document.querySelector('.app-top-nav-bar');
    if (header) {
      const toggle = header.querySelector('.mobile-nav-toggle');
      if (toggle && container.nextSibling !== toggle) {
        header.insertBefore(container, toggle);
      } else if (!toggle && container.parentElement !== header) {
        header.appendChild(container);
      }
    }
  } else {
    const navBar = document.querySelector('.horizontal-nav');
    if (navBar) {
      const userSection = navBar.querySelector('.nav-user-section');
      if (userSection && container.nextSibling !== userSection) {
        navBar.insertBefore(container, userSection);
      } else if (!userSection && container.parentElement !== navBar) {
        navBar.appendChild(container);
      }
    }
  }
}

function renderNotificationDropdown(userId) {
  const existing = document.getElementById('notification-dropdown-container');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'notification-dropdown-container';
  container.innerHTML = `
    <div class="notif-bell-wrapper" id="notif-bell-wrapper">
      <i data-lucide="bell" class="notif-bell-icon"></i>
      <span id="notif-badge" class="notif-badge" style="display:none">0</span>
    </div>
    <div class="notif-dropdown" id="notif-dropdown" style="display:none">
      <div class="notif-dropdown-header">
        <span class="notif-dropdown-title">Notifications</span>
        <button class="notif-mark-all-btn" id="notif-mark-all-btn">Mark all read</button>
      </div>
      <div class="notif-dropdown-body" id="notif-dropdown-body">
        <div class="notif-empty">Loading notifications...</div>
      </div>
    </div>
  `;

  const header = document.querySelector('.app-top-nav-bar');
  if (header) {
    header.appendChild(container);
  }
  adjustNotificationBellPlacement();

  const bellWrapper = container.querySelector('#notif-bell-wrapper');
  const dropdown = container.querySelector('#notif-dropdown');

  bellWrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.style.display !== 'none';
    dropdown.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) fetchNotifications(userId);
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  const markAllBtn = container.querySelector('#notif-mark-all-btn');
  markAllBtn.addEventListener('click', () => {
    markAllNotificationsRead(userId);
  });

  return container;
}

function fetchNotifications(userId) {
  settingsApi.getNotifications(userId).then(notifs => {
    const notifCount = notifs.filter(n => !n.is_read).length;
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (notifCount > 0) {
        badge.textContent = notifCount > 9 ? '9+' : notifCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
    const body = document.getElementById('notif-dropdown-body');
    if (!body) return;
    if (notifs.length === 0) {
      body.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
    } else {
      body.innerHTML = notifs.slice(0, 20).map(n => `
        <div class="notif-item ${n.is_read ? '' : 'notif-unread'}" data-id="${n.id}">
          <div class="notif-item-icon">${getNotifIconHTML(getNotificationIcon(n.notification_type))}</div>
          <div class="notif-item-content">
            <div class="notif-item-title">${n.title}</div>
            <div class="notif-item-msg">${n.message}</div>
          </div>
          ${!n.is_read ? `<button class="notif-mark-read" data-id="${n.id}">${getNotifIconHTML('check')}</button>` : ''}
        </div>
      `).join('');

      body.querySelectorAll('.notif-mark-read').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          settingsApi.markNotificationRead(userId, id).then(() => {
            fetchNotifications(userId);
          }).catch(() => {});
        });
      });
    }
    window.lucide?.createIcons();
  }).catch(() => {});
}

function getNotifIconHTML(iconName) {
  return `<i data-lucide="${iconName}" style="width:18px;height:18px;"></i>`;
}

function markAllNotificationsRead(userId) {
  settingsApi.markAllNotificationsRead(userId).then(() => {
    fetchNotifications(userId);
  }).catch(() => {});
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
      <a href="#profile" class="nav-user-avatar" title="${user.name}">${initial}</a>
      <a href="#profile" class="nav-user-name">${user.name}</a>
      <button class="nav-logout-btn" id="logout-btn">Logout</button>
    `;

    const logoutBtn = userSection.querySelector('#logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        logout();
        window.location.hash = '#auth/login';
      });
    }

    if (user.id) {
      renderNotificationDropdown(user.id);
      fetchNotifications(user.id);

      if (notificationPollInterval) clearInterval(notificationPollInterval);
      notificationPollInterval = setInterval(() => fetchNotifications(user.id), 60000);
    }
  } else {
    userSection.innerHTML = '';
    const container = document.getElementById('notification-dropdown-container');
    if (container) container.remove();
    if (notificationPollInterval) {
      clearInterval(notificationPollInterval);
      notificationPollInterval = null;
    }
  }
}

function initializeApp() {
  window.addEventListener('hashchange', handleRouting);
  window.addEventListener('resize', adjustNotificationBellPlacement);

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
