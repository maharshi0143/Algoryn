import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const aiService = {
  getInsights: () => api.get(`${ENDPOINTS.ai}/insights`),
  getRecommendations: () => api.get(`${ENDPOINTS.ai}/recommendations`),
  getWeakness: () => api.get(`${ENDPOINTS.ai}/weakness`),
};
