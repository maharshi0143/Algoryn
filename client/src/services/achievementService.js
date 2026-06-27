import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const achievementService = {
  getAll: () => api.get(ENDPOINTS.achievements),
  check: () => api.post(ENDPOINTS.achievements),
};

