import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const dashboardService = {
  getStats: () => api.get(ENDPOINTS.dashboardStats),
  getHeatmap: () => api.get(ENDPOINTS.dashboardHeatmap),
  getWeekly: () => api.get(ENDPOINTS.dashboardWeekly),
};

export const DASHBOARD_QUERY_KEY = ["dashboardStats"];
