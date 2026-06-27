import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const leaderboardService = {
  getFriendsLeaderboard: () => api.get(ENDPOINTS.leaderboardFriends),
  getTopStreaks: () => api.get(ENDPOINTS.leaderboardStreaks),
};
