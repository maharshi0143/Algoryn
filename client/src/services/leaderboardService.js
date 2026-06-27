import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const leaderboardService = {
  getGlobal: (page = 1, limit = 50) =>
    api.get(`${ENDPOINTS.leaderboard}?page=${page}&limit=${limit}`),
  getFriends: () => api.get(ENDPOINTS.leaderboardFriends),
  getPlatform: (platform) => api.get(ENDPOINTS.leaderboardPlatform(platform)),
  getStreaks: () => api.get(ENDPOINTS.leaderboardStreaks),
  getContributors: () => api.get(ENDPOINTS.leaderboardContributions),
};
