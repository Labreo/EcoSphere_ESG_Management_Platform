let toastTimer = null;

export function showToast(message, type = 'success') {
  const existing = document.querySelectorAll('.global-toast');
  existing.forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `global-toast global-toast-${type}`;

  let icon = 'check-circle';
  if (type === 'warning') icon = 'alert-triangle';
  if (type === 'error') icon = 'alert-octagon';
  if (type === 'info') icon = 'info';

  toast.innerHTML = `
    <i data-lucide="${icon}" class="toast-icon"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  if (window.lucide) {
    window.lucide.createIcons();
  }

  if (toastTimer) clearTimeout(toastTimer);
  requestAnimationFrame(() => toast.classList.add('show'));

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function renderLoading(container) {
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading data...</div>
    </div>
  `;
}

export function renderError(container, message) {
  container.innerHTML = `
    <div class="error-container">
      <i data-lucide="alert-circle"></i>
      <div class="error-title">Something went wrong</div>
      <div class="error-message">${message}</div>
      <button class="error-retry-btn" onclick="location.reload()">Retry</button>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();
}
