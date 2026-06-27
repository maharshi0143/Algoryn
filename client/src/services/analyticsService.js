import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const analyticsService = {
  getPlatforms: () => api.get(`${ENDPOINTS.analytics}/platforms`),
  getDifficulty: () => api.get(`${ENDPOINTS.analytics}/difficulty`),
  getContributions: () => api.get(`${ENDPOINTS.analytics}/contributions`),
  getYearly: () => api.get(`${ENDPOINTS.analytics}/yearly`),
  getLanguages: () => api.get(`${ENDPOINTS.analytics}/languages`),
};

export const ANALYTICS_QUERY_KEY = ["analytics"];
