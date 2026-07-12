import { get, post, put, del, patch } from './client.js';

function mapDepartment(d) {
  return {
    id: String(d.id),
    name: d.name,
    code: d.code,
    head: d.head || 'Unassigned',
    parent_department_id: d.parent_department_id,
    employee_count: d.employee_count || 0,
    status: d.status,
  };
}

function mapCategory(c) {
  return {
    id: String(c.id),
    name: c.name,
    type: c.type === 'CSR Activity' ? 'CSR Category' : 'Challenge Category',
    count: 0,
    status: c.status,
  };
}

function mapNotification(n) {
  return {
    id: String(n.id),
    title: n.title,
    message: n.message,
    type: n.notification_type,
    is_read: n.is_read,
    created_at: n.created_at,
  };
}

export async function getDepartments() {
  const data = await get('/departments');
  return data.map(mapDepartment);
}

export async function createDepartment(data) {
  const result = await post('/departments', {
    name: data.name,
    code: data.code || data.name.substring(0, 4).toUpperCase(),
    head: data.head || null,
    employee_count: parseInt(data.employee_count || 0),
    status: data.status || 'Active',
  });
  return mapDepartment(result);
}

export async function updateDepartment(id, data) {
  const result = await put(`/departments/${id}`, {
    name: data.name,
    code: data.code,
    head: data.head,
    employee_count: data.employee_count !== undefined ? parseInt(data.employee_count) : undefined,
    status: data.status,
  });
  return mapDepartment(result);
}

export async function deleteDepartment(id) {
  return del(`/departments/${id}`);
}

export async function getCategories() {
  const data = await get('/settings/categories');
  return data.map(mapCategory);
}

export async function createCategory(data) {
  const result = await post('/settings/categories', {
    name: data.name,
    type: data.type === 'CSR Category' ? 'CSR Activity' : 'Challenge',
    status: data.status || 'Active',
  });
  return mapCategory(result);
}

export async function getConfig() {
  return get('/settings/config');
}

export async function updateConfig(data) {
  return patch('/settings/config', data);
}

export async function getNotifications(employeeId, unreadOnly = false) {
  const params = new URLSearchParams({ employee_id: employeeId });
  if (unreadOnly) params.set('unread_only', 'true');
  const data = await get(`/notifications?${params.toString()}`);
  return data.map(mapNotification);
}

export async function markNotificationRead(id, employeeId) {
  return patch(`/notifications/${id}/read?employee_id=${employeeId}`);
}

export async function markAllNotificationsRead(employeeId) {
  return patch(`/notifications/read-all?employee_id=${employeeId}`);
}

export async function getNotificationPreferences() {
  return get('/settings/notification-preferences');
}

export async function saveNotificationPreferences(preferences) {
  return put('/settings/notification-preferences', { preferences });
}
