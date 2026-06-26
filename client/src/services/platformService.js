import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";

export const PLATFORMS = [
  { id: "leetcode", name: "LeetCode", color: "#FFD93D", icon: "🟨" },
  { id: "github", name: "GitHub", color: "#121212", icon: "🐙" },
  { id: "codeforces", name: "Codeforces", color: "#4D96FF", icon: "💙" },
  { id: "codechef", name: "CodeChef", color: "#6BCB77", icon: "💚" },
  { id: "gfg", name: "GeeksforGeeks", color: "#6BCB77", icon: "🌿" },
  { id: "hackerrank", name: "HackerRank", color: "#6BCB77", icon: "🏅" },
];

export const platformService = {
  sync: (platform) => api.post(ENDPOINTS.syncPlatform(platform)),

  syncAll: () => api.post(ENDPOINTS.syncAll),

  getUpcomingContests: () => api.get(ENDPOINTS.upcomingContests),
};
