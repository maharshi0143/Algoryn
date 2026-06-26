import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const authService = {
  register: (name, email, password) =>
    api.post(ENDPOINTS.register, { name, email, password }),

  login: (email, password) =>
    api.post(ENDPOINTS.login, { email, password }),

  logout: () => api.post(ENDPOINTS.logout),

  getMe: () => api.get(ENDPOINTS.me),

  refreshToken: () => api.post(ENDPOINTS.refreshToken),

  changePassword: (currentPassword, newPassword) =>
    api.put("/auth/password", { currentPassword, newPassword }),

  deleteAccount: () => api.delete("/auth/me"),
};
