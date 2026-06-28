const problemStatsRepository = require("../repositories/problemStatsRepository");
const githubStatsRepository = require("../repositories/githubStatsRepository");
const dailyStatsRepository = require("../repositories/dailyStatsRepository");

// Get overview stats combining problem, GitHub data, XP, and daily claim status
const getOverview = async (userId) => {
    const [problemStats, githubStats, totalXP] = await Promise.all([
        problemStatsRepository.findProblemStatsByUserId(userId),
        githubStatsRepository.findGithubStatsByUserId(userId),
        dailyStatsRepository.sumClaimedXP(userId),
    ]);

    const today = new Date().toISOString().split("T")[0];
    const todayStats = await dailyStatsRepository.findByUserAndDate(userId, today);

    return {
        totalSolved: Number(problemStats?.total_solved ?? 0),
        easy: Number(problemStats?.easy_count ?? 0),
        medium: Number(problemStats?.medium_count ?? 0),
        hard: Number(problemStats?.hard_count ?? 0),
        streak: Number(problemStats?.streak ?? 0),
        repositories: Number(githubStats?.repositories ?? 0),
        followers: Number(githubStats?.followers ?? 0),
        contributions: Number(githubStats?.contributions ?? 0),
        today_solved: Number(todayStats?.problems_solved ?? 0),
        claimed: Boolean(todayStats?.claimed ?? false),
        total_xp: totalXP,
    };
};

// Get daily stats for the last 7 days
const getWeeklyStats = async (userId) => {
    return await dailyStatsRepository.findWeeklyStats(userId);
};

// Get daily stats for the last 30 days
const getMonthlyStats = async (userId) => {
    return await dailyStatsRepository.findMonthlyStats(userId);
};

// Get all daily stats for heatmap rendering
const getHeatmapStats = async (userId) => {
    return await dailyStatsRepository.findHeatmapStats(userId);
};

// Get combined chart data for the dashboard
const getCharts = async (userId) => {
    const [overview, weekly, monthly] = await Promise.all([
        getOverview(userId),
        getWeeklyStats(userId),
        getMonthlyStats(userId),
    ]);

    return { overview, weekly, monthly };
};

module.exports = {
    getOverview,
    getWeeklyStats,
    getMonthlyStats,
    getHeatmapStats,
    getCharts,
};
