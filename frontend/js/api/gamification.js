import { get, post, put, del, patch } from './client.js';

function mapChallenge(c) {
  return {
    id: `c${c.id}`,
    title: c.title,
    category: `Category ${c.category_id}`,
    description: c.description,
    xp: c.xp,
    difficulty: c.difficulty,
    deadline: c.deadline ? c.deadline.split('T')[0] : 'No deadline',
    status: c.status === 'Draft' ? 'Draft' : c.status === 'Active' ? 'Active' : c.status === 'Under Review' ? 'Under Review' : 'Completed',
    evidenceRequired: c.evidence_required,
  };
}

function mapBadge(b) {
  return {
    id: `badge${b.id}`,
    name: b.name,
    description: b.description,
    icon: b.icon || 'award',
    unlocked: false,
  };
}

function mapReward(r) {
  return {
    id: `reward${r.id}`,
    name: r.name,
    description: r.description,
    cost: r.points_required,
    stock: r.stock,
    status: r.status,
  };
}

export async function getChallenges() {
  const data = await get('/gamification/challenges');
  return data.map(mapChallenge);
}

export async function getChallenge(id) {
  const data = await get(`/gamification/challenges/${id}`);
  return mapChallenge(data);
}

export async function createChallenge(data) {
  const result = await post('/gamification/challenges', {
    title: data.title,
    category_id: parseInt(data.category_id || 1),
    description: data.description || '',
    xp: parseInt(data.xp || 100),
    difficulty: data.difficulty || 'Medium',
    evidence_required: data.evidence_required !== false,
    deadline: data.deadline ? new Date(data.deadline).toISOString() : new Date().toISOString(),
    status: data.status || 'Draft',
  });
  return mapChallenge(result);
}

export async function updateChallenge(id, data) {
  const numericId = id.replace('c', '');
  const result = await put(`/gamification/challenges/${numericId}`, {
    title: data.title,
    description: data.description,
    xp: data.xp ? parseInt(data.xp) : undefined,
    difficulty: data.difficulty,
    evidence_required: data.evidence_required,
    deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
  });
  return mapChallenge(result);
}

export async function deleteChallenge(id) {
  const numericId = id.replace('c', '');
  return del(`/gamification/challenges/${numericId}`);
}

export async function updateChallengeStatus(id, status) {
  const numericId = id.replace('c', '');
  const result = await patch(`/gamification/challenges/${numericId}/status`, { status });
  return mapChallenge(result);
}

export async function participateInChallenge(challengeId, employeeId) {
  const numericId = challengeId.replace('c', '');
  return post(`/gamification/challenges/${numericId}/participate`, { employee_id: parseInt(employeeId) });
}

export async function submitEvidence(challengeId, employeeId, proofUrl) {
  const numericId = challengeId.replace('c', '');
  return post(`/gamification/challenges/${numericId}/submit-evidence`, {
    employee_id: parseInt(employeeId),
    proof_file_url: proofUrl,
  });
}

export async function approveParticipation(participationId, employeeId) {
  return post(`/gamification/challenges/participations/${participationId}/approve`, {
    employee_id: parseInt(employeeId),
  });
}

export async function getBadges() {
  const data = await get('/gamification/badges');
  return data.map(mapBadge);
}

export async function getRewards() {
  const data = await get('/gamification/rewards');
  return data.map(mapReward);
}

export async function redeemReward(rewardId, employeeId) {
  const numericId = rewardId.replace('reward', '');
  return post(`/gamification/rewards/${numericId}/redeem`, { employee_id: parseInt(employeeId) });
}

export async function getLeaderboard(type = 'individual', limit = 50) {
  return get(`/gamification/leaderboard?type=${type}&limit=${limit}`);
}
