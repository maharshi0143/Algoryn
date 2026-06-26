import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const dashboardService = {
  getStats: () => api.get(ENDPOINTS.dashboardStats),

  getHeatmap: () => api.get(ENDPOINTS.dashboardHeatmap),

  getLeaderboard: (page = 1, limit = 50) =>
    api.get(ENDPOINTS.leaderboard, { params: { page, limit } }),

  getFriendsLeaderboard: () => api.get(ENDPOINTS.leaderboardFriends),

  getPlatformLeaderboard: (platform) =>
    api.get(ENDPOINTS.leaderboardPlatform(platform)),

  getNotifications: (page = 1) =>
    api.get(ENDPOINTS.notifications, { params: { page } }),

  getAchievements: () => api.get(ENDPOINTS.achievements),

  getGoals: () => api.get(ENDPOINTS.goals),
};
