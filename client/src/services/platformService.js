import api from "../api/axios";
import { ENDPOINTS } from "../constants/api";
import {
  LeetCodeIcon,
  GitHubIcon,
  CodeforcesIcon,
  CodeChefIcon,
  GeeksforGeeksIcon,
  HackerRankIcon,
} from "../components/ui/PlatformIcons";

export const PLATFORMS = [
  { id: "leetcode", name: "LeetCode", color: "#FFD93D", icon: LeetCodeIcon },
  { id: "github", name: "GitHub", color: "#121212", icon: GitHubIcon },
  { id: "codeforces", name: "Codeforces", color: "#4D96FF", icon: CodeforcesIcon },
  { id: "codechef", name: "CodeChef", color: "#6BCB77", icon: CodeChefIcon },
  { id: "gfg", name: "GeeksforGeeks", color: "#6BCB77", icon: GeeksforGeeksIcon },
  { id: "hackerrank", name: "HackerRank", color: "#6BCB77", icon: HackerRankIcon },
];

export const platformService = {
  sync: (platform) => api.post(ENDPOINTS.syncPlatform(platform)),

  syncAll: () => api.post(ENDPOINTS.syncAll),

  getUpcomingContests: () => api.get(ENDPOINTS.upcomingContests),
};
