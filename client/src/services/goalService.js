import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const goalService = {
  list: () => api.get(ENDPOINTS.goals),
  getById: (id) => api.get(`${ENDPOINTS.goals}/${id}`),
  create: (data) => api.post(ENDPOINTS.goals, data),
  updateProgress: (id, current_progress) => api.patch(`${ENDPOINTS.goals}/${id}/progress`, { current_progress }),
  delete: (id) => api.delete(`${ENDPOINTS.goals}/${id}`),
};
