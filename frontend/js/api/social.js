import { get, post, put, del } from './client.js';

function mapActivity(a) {
  return {
    id: String(a.id),
    emoji: getActivityEmoji(a.title),
    title: a.title,
    description: a.description,
    joinedCount: 0,
    requirement: a.status === 'Upcoming' ? 'Open' : 'Closed',
    xp: a.points_reward,
    joined: false,
    category_id: a.category_id,
    date: a.date,
    max_participants: a.max_participants,
    status: a.status,
  };
}

function getActivityEmoji(title) {
  const t = title.toLowerCase();
  if (t.includes('tree') || t.includes('plant')) return '🌳';
  if (t.includes('blood')) return '🩸';
  if (t.includes('beach') || t.includes('clean')) return '🏖️';
  if (t.includes('workshop') || t.includes('educ')) return '📚';
  if (t.includes('health') || t.includes('wellness')) return '🏥';
  return '🌟';
}

function mapParticipation(p) {
  return {
    id: String(p.id),
    employee_id: p.employee_id,
    activity_id: p.activity_id,
    employee: `Employee #${p.employee_id}`,
    activity: `Activity #${p.activity_id}`,
    proof: p.proof_file_url || 'No proof',
    points: p.points_earned || 0,
    status: p.approval_status,
  };
}

export async function getActivities() {
  const data = await get('/social/activities');
  return data.map(mapActivity);
}

export async function getActivity(id) {
  const data = await get(`/social/activities/${id}`);
  return mapActivity(data);
}

export async function createActivity(data) {
  const result = await post('/social/activities', {
    title: data.title,
    description: data.description || '',
    category_id: parseInt(data.category_id),
    date: data.date,
    points_reward: parseInt(data.points_reward || 50),
    max_participants: parseInt(data.max_participants || 50),
    status: data.status || 'Upcoming',
  });
  return mapActivity(result);
}

export async function updateActivity(id, data) {
  const result = await put(`/social/activities/${id}`, {
    title: data.title,
    description: data.description,
    category_id: data.category_id ? parseInt(data.category_id) : undefined,
    date: data.date,
    points_reward: data.points_reward ? parseInt(data.points_reward) : undefined,
    max_participants: data.max_participants ? parseInt(data.max_participants) : undefined,
    status: data.status,
  });
  return mapActivity(result);
}

export async function deleteActivity(id) {
  return del(`/social/activities/${id}`);
}

export async function joinActivity(id) {
  const result = await post(`/social/activities/${id}/join`);
  return mapParticipation(result);
}

export async function submitProof(activityId, proofUrl) {
  const result = await post(`/social/activities/${activityId}/submit-proof`, {
    proof_file_url: proofUrl,
  });
  return mapParticipation(result);
}

export async function approveParticipation(participationId) {
  const result = await post(`/social/participations/${participationId}/approve`);
  return mapParticipation(result);
}

export async function getDiversityMetrics() {
  return get('/social/diversity-metrics');
}
