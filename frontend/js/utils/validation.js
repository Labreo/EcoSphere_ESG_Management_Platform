export const validators = {
  required: (v) => (v?.trim?.()?.length > 0) || 'This field is required',

  minLength: (n) => (v) =>
    (v?.length >= n) || `Minimum ${n} characters`,

  maxLength: (n) => (v) =>
    (v?.length <= n) || `Maximum ${n} characters`,

  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email address',

  url: (v) =>
    !v || /^https?:\/\/.+/.test(v) || 'Must be a valid URL (http/https)',

  numberBetween: (min, max) => (v) => {
    const n = parseFloat(v);
    return (!isNaN(n) && n >= min && n <= max) || `Must be between ${min} and ${max}`;
  },

  integerBetween: (min, max) => (v) => {
    const n = parseInt(v, 10);
    return (Number.isInteger(n) && n >= min && n <= max) || `Must be between ${min} and ${max}`;
  },

  positiveNumber: (v) => {
    const n = parseFloat(v);
    return (!isNaN(n) && n > 0) || 'Must be a positive number';
  },

  oneOf: (values) => (v) =>
    values.includes(v) || `Must be one of: ${values.join(', ')}`,

  date: (v) =>
    !v || /^\d{4}-\d{2}-\d{2}$/.test(v) || 'Must be a valid date (YYYY-MM-DD)',

  futureDate: (v) => {
    if (!v) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Must be a valid date (YYYY-MM-DD)';
    const d = new Date(v);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today || 'Date must be today or in the future';
  },

  matches: (pattern, msg) => (v) =>
    pattern.test(v) || (msg || 'Invalid format'),
};

export function validateField(value, rules) {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) return result;
  }
  return null;
}

export function validateForm(formEl, fieldRules) {
  clearAllErrors(formEl);
  let isValid = true;

  for (const [fieldName, rules] of Object.entries(fieldRules)) {
    const input = formEl.querySelector(`[name="${fieldName}"]`);
    if (!input) continue;
    const error = validateField(input.value, rules);
    if (error) {
      showFieldError(input, error);
      isValid = false;
    }
  }

  return isValid;
}

export function showFieldError(input, message) {
  input.classList.add('input-error');
  const existing = input.parentElement?.querySelector('.field-error');
  if (existing) existing.remove();
  const errEl = document.createElement('span');
  errEl.className = 'field-error';
  errEl.textContent = message;
  input.parentElement?.appendChild(errEl);
}

export function clearFieldError(input) {
  input.classList.remove('input-error');
  const existing = input.parentElement?.querySelector('.field-error');
  if (existing) existing.remove();
}

export function clearAllErrors(formEl) {
  formEl.querySelectorAll('.input-error').forEach((el) => el.classList.remove('input-error'));
  formEl.querySelectorAll('.field-error').forEach((el) => el.remove());
}

export function sanitize(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return str.replace(/[&<>"']/g, (ch) => map[ch]);
}
