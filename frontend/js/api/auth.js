import { post, get } from './client.js';

export async function login(email, password) {
  const data = await post('/auth/login', { email, password });
  localStorage.setItem('esg_token', data.access_token);
  const user = await getMe();
  localStorage.setItem('esg_user', JSON.stringify(user));
  return user;
}

export async function register(name, email, password, role = 'Employee') {
  const user = await post('/auth/register', { name, email, password, role });
  const data = await post('/auth/login', { email, password });
  localStorage.setItem('esg_token', data.access_token);
  localStorage.setItem('esg_user', JSON.stringify(user));
  return user;
}

export async function getMe() {
  return get('/auth/me');
}

export function logout() {
  localStorage.removeItem('esg_token');
  localStorage.removeItem('esg_user');
}

export function getStoredUser() {
  const raw = localStorage.getItem('esg_user');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return !!localStorage.getItem('esg_token');
}
