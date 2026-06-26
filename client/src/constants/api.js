export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const ENDPOINTS = {
  // Auth
  register: "/auth/register",
  login: "/auth/login",
  logout: "/auth/logout",
  me: "/auth/me",
  refreshToken: "/auth/refresh-token",


  // Profiles
  profiles: "/profiles",
  profileByPlatform: (platform) => `/profiles/platform/${platform}`,

  // Sync
  sync: "/sync",
  syncPlatform: (platform) => `/sync/${platform}`,
  syncAll: "/sync/all",

  // Dashboard
  dashboard: "/dashboard",
  dashboardStats: "/dashboard/stats",
  dashboardHeatmap: "/dashboard/heatmap",

  // Analytics
  analytics: "/analytics",

  // Achievements
  achievements: "/achievements",

  // Contests
  contests: "/contests",
  upcomingContests: "/contests/upcoming",

  // Leaderboard
  leaderboard: "/leaderboard",
  leaderboardFriends: "/leaderboard/friends",
  leaderboardPlatform: (platform) => `/leaderboard/platform/${platform}`,
  leaderboardStreaks: "/leaderboard/streaks",
  leaderboardContributions: "/leaderboard/contributions",

  // AI
  ai: "/ai",
  aiRecommendation: "/ai/recommendation",

  // Goals
  goals: "/goals",

  // Friends
  friends: "/friends",

  // Notifications
  notifications: "/notifications",

  // Daily Stats
  dailyStats: "/daily-stats",

  // Reports
  reports: "/reports",

  // Contest Reminders
  contestReminders: "/contest-reminders",

  // Public Profile
  publicProfile: (username) => `/public/${username}`,

  // Export
  export: "/export",

  // Email Preferences
  emailPreferences: "/email-preferences",

  // Health
  health: "/health",
};
