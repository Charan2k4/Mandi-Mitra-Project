/**
 * Centralized API service for Mandi Mitra
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const apiService = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(res);
  },

  // Locations
  getStates: async () => {
    const res = await fetch(`${API_BASE_URL}/locations/states`);
    return handleResponse(res);
  },

  getDistricts: async (stateId = null) => {
    const url = stateId
      ? `${API_BASE_URL}/locations/districts?state_id=${stateId}`
      : `${API_BASE_URL}/locations/districts`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  // Crops & Varieties
  getCrops: async () => {
    const res = await fetch(`${API_BASE_URL}/crops`);
    return handleResponse(res);
  },

  getVarieties: async (cropId) => {
    const res = await fetch(`${API_BASE_URL}/crops/${cropId}/varieties`);
    return handleResponse(res);
  },

  // Mandis
  getMandis: async (districtId = null) => {
    const url = districtId
      ? `${API_BASE_URL}/mandis?district_id=${districtId}`
      : `${API_BASE_URL}/mandis`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  getNearbyMandis: async (lat, lng, radiusKm = 100) => {
    const res = await fetch(`${API_BASE_URL}/mandis/nearby?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`);
    return handleResponse(res);
  },

  // Prices & History
  getPriceHistory: async (commodityId, varietyId = null, mandiId = null, days = 35) => {
    const params = new URLSearchParams({ commodity_id: commodityId, days });
    if (varietyId) params.append('variety_id', varietyId);
    if (mandiId) params.append('mandi_id', mandiId);

    const res = await fetch(`${API_BASE_URL}/prices/history?${params.toString()}`);
    return handleResponse(res);
  },

  // Comparison Engine
  compareMandis: async (comparisonData) => {
    const res = await fetch(`${API_BASE_URL}/advisor/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comparisonData),
    });
    return handleResponse(res);
  },

  // Sell-or-Hold Advisor
  getSellOrHoldAdvice: async (advisorParams) => {
    const res = await fetch(`${API_BASE_URL}/advisor/sell-or-hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(advisorParams),
    });
    return handleResponse(res);
  },
};
