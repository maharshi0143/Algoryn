import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const contestService = {
  getUpcomingContests: () => api.get(ENDPOINTS.upcomingContests),
  getHistory: (page = 1, limit = 20) =>
    api.get(`${ENDPOINTS.contests}?page=${page}&limit=${limit}`),
  getRatingGraph: () => api.get(`${ENDPOINTS.contests}/rating`),
  syncHistory: () => api.post(`${ENDPOINTS.contests}/sync`),
};
