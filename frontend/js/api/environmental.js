import { get, post, put, del } from './client.js';

function mapFactor(f) {
  return {
    id: String(f.id),
    activity: f.activity_type,
    category: f.status === 'Active' ? 'Active' : 'Inactive',
    value: f.factor_value,
    unit: f.unit,
    source: 'API',
    status: f.status,
  };
}

function mapProduct(p) {
  return {
    id: String(p.id),
    sku: p.product_sku,
    name: p.product_name,
    class: 'Electronics',
    carbon: p.carbon_footprint_kg,
    recyclability: p.recyclability_percentage,
    xp: Math.round(p.recyclability_percentage / 10),
  };
}

function mapGoal(g) {
  return {
    id: String(g.id),
    name: g.title,
    department: 'Corporate',
    target: g.target_emission_reduction,
    current: g.current_progress,
    deadline: g.target_date,
    status: g.status === 'Met' ? 'Completed' : g.status === 'Missed' ? 'Overdue' : g.status,
  };
}

function mapTransaction(t) {
  return {
    id: String(t.id),
    date: t.transaction_date,
    dept: `Department ${t.department_id}`,
    source: t.source_type,
    qty: `${t.raw_value}`,
    calculated: t.calculated_emissions_kg / 1000,
    origin: 'API',
  };
}

export async function getFactors() {
  const data = await get('/environmental/factors');
  return data.map(mapFactor);
}

export async function createFactor(data) {
  const result = await post('/environmental/factors', {
    activity_type: data.activity,
    factor_value: parseFloat(data.value),
    unit: data.unit,
    status: data.status,
  });
  return mapFactor(result);
}

export async function updateFactor(id, data) {
  const result = await put(`/environmental/factors/${id}`, {
    activity_type: data.activity,
    factor_value: parseFloat(data.value),
    unit: data.unit,
    status: data.status,
  });
  return mapFactor(result);
}

export async function deleteFactor(id) {
  return del(`/environmental/factors/${id}`);
}

export async function getProducts() {
  const data = await get('/environmental/products');
  return data.map(mapProduct);
}

export async function createProduct(data) {
  const result = await post('/environmental/products', {
    product_name: data.name,
    product_sku: data.sku,
    carbon_footprint_kg: parseFloat(data.carbon),
    recyclability_percentage: parseInt(data.recyclability),
    water_footprint_liters: 0,
    status: 'Active',
  });
  return mapProduct(result);
}

export async function updateProduct(id, data) {
  const result = await put(`/environmental/products/${id}`, {
    product_name: data.name,
    product_sku: data.sku,
    carbon_footprint_kg: parseFloat(data.carbon),
    recyclability_percentage: parseInt(data.recyclability),
  });
  return mapProduct(result);
}

export async function deleteProduct(id) {
  return del(`/environmental/products/${id}`);
}

export async function getGoals() {
  const data = await get('/environmental/goals');
  return data.map(mapGoal);
}

export async function createGoal(data) {
  const result = await post('/environmental/goals', {
    title: data.name,
    target_emission_reduction: parseFloat(data.target),
    target_date: data.deadline,
    current_progress: parseFloat(data.current || 0),
    status: data.status === 'Completed' ? 'Met' : data.status === 'Overdue' ? 'Missed' : data.status,
  });
  return mapGoal(result);
}

export async function updateGoal(id, data) {
  const result = await put(`/environmental/goals/${id}`, {
    title: data.name,
    target_emission_reduction: parseFloat(data.target),
    target_date: data.deadline,
    current_progress: parseFloat(data.current),
    status: data.status === 'Completed' ? 'Met' : data.status === 'Overdue' ? 'Missed' : data.status,
  });
  return mapGoal(result);
}

export async function deleteGoal(id) {
  return del(`/environmental/goals/${id}`);
}

export async function logTransaction(data) {
  const result = await post('/environmental/transactions', {
    source_type: data.source_type,
    source_id: data.source_id || 'manual',
    raw_value: data.raw_value,
    emission_factor_id: parseInt(data.emission_factor_id),
    department_id: data.department_id,
  });
  return mapTransaction(result);
}

export async function getDashboard(departmentId, startDate, endDate, groupBy = 'month') {
  const params = new URLSearchParams();
  if (departmentId) params.set('department_id', departmentId);
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  params.set('group_by', groupBy);
  const qs = params.toString();
  const data = await get(`/environmental/dashboard${qs ? '?' + qs : ''}`);
  return data;
}
