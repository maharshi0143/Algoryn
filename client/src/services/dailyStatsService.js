import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const dailyStatsService = {
  populate: () => api.post(`${ENDPOINTS.dailyStats}/populate`),
  getDailyStats: () => api.get(ENDPOINTS.dailyStats),
};
