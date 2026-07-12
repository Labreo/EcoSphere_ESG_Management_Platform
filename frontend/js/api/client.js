const API_BASE = 'http://localhost:8000/api/v1';

function getToken() {
  return localStorage.getItem('esg_token');
}

function getAuthHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (response.status === 401) {
    localStorage.removeItem('esg_token');
    localStorage.removeItem('esg_user');
    if (window.location.hash !== '#auth/login') {
      window.location.hash = '#auth/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    const message = data.detail || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export function get(endpoint) {
  return request(endpoint, { method: 'GET' });
}

export function post(endpoint, body) {
  return request(endpoint, { method: 'POST', body });
}

export function put(endpoint, body) {
  return request(endpoint, { method: 'PUT', body });
}

export function patch(endpoint, body) {
  return request(endpoint, { method: 'PATCH', body });
}

export function del(endpoint) {
  return request(endpoint, { method: 'DELETE' });
}
