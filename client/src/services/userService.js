import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const userService = {
  getProfile: () => api.get(ENDPOINTS.profiles),

  updateProfile: (data) => api.put(ENDPOINTS.profiles, data),

  connectPlatform: (platform, username) =>
    api.post(ENDPOINTS.profiles, { platform, username }),

  updatePlatform: (id, username) =>
    api.put(`${ENDPOINTS.profiles}/${id}`, { username }),

  getPlatforms: () => api.get(ENDPOINTS.profiles),

  deletePlatform: (id) => api.delete(`${ENDPOINTS.profiles}/${id}`),
};
