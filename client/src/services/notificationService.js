import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const notificationService = {
  list: (page = 1, limit = 20) => api.get(ENDPOINTS.notifications, { params: { page, limit } }),
  markRead: (id) => api.patch(`${ENDPOINTS.notifications}/${id}`),
  delete: (id) => api.delete(`${ENDPOINTS.notifications}/${id}`),
  getUnreadCount: () => api.get(`${ENDPOINTS.notifications}/unread-count`),
};
