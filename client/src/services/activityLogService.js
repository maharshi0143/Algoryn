import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const activityLogService = {
  getRecentActivities: (limit = 10) =>
    api.get(`${ENDPOINTS.activityLogs}?limit=${limit}`),
};
