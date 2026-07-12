import { post } from './client.js';

function makeFilters(filters = {}) {
  return {
    department_id: filters.department_id ? parseInt(filters.department_id) : null,
    start_date: filters.start_date || null,
    end_date: filters.end_date || null,
    module: filters.module || null,
    employee_id: filters.employee_id ? parseInt(filters.employee_id) : null,
    challenge_id: filters.challenge_id ? parseInt(filters.challenge_id) : null,
    category_id: filters.category_id ? parseInt(filters.category_id) : null,
  };
}

export async function getEnvironmentalReport(filters = {}) {
  return post('/reports/environmental', makeFilters(filters));
}

export async function getSocialReport(filters = {}) {
  return post('/reports/social', makeFilters(filters));
}

export async function getGovernanceReport(filters = {}) {
  return post('/reports/governance', makeFilters(filters));
}

export async function getESGSummary(filters = {}) {
  return post('/reports/summary', makeFilters(filters));
}

export async function exportReport(format = 'csv', filters = {}) {
  return post(`/reports/export/${format}`, makeFilters(filters));
}
