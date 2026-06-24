const dashboardService = require("./dashboardService");
const dailyStatsRepository = require("../repositories/dailyStatsRepository");

const populateDailyStats = async (userId) => {
    const today = new Date().toISOString().split("T")[0];

    const overview = await dashboardService.getOverview(userId);

    return await dailyStatsRepository.upsertDailyStats(
        userId,
        today,
        Number(overview.totalSolved) || 0,
        Number(overview.easy) || 0,
        Number(overview.medium) || 0,
        Number(overview.hard) || 0,
        Number(overview.contributions) || 0,
    );
};

const getDailyStats = async (userId) => {
    return await dailyStatsRepository.findWeeklyStats(userId);
};

module.exports = {
    populateDailyStats,
    getDailyStats,
};