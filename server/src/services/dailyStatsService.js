const dashboardService = require("./dashboardService");
const dailyStatsRepository = require("../repositories/dailyStatsRepository");
const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");

const populateDailyStats = async (userId) => {
    const today = new Date().toISOString().split("T")[0];

    const overview = await dashboardService.getOverview(userId);

    const todaySolved = Number(overview.today_solved ?? 0);

    if (todaySolved === 0) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Solve some problems first before claiming XP");
    }

    if (overview.claimed) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You already claimed XP today");
    }

    await dailyStatsRepository.upsertDailyStats(
        userId,
        today,
        Number(overview.totalSolved) || 0,
        Number(overview.easy) || 0,
        Number(overview.medium) || 0,
        Number(overview.hard) || 0,
        Number(overview.contributions) || 0,
    );

    return await dailyStatsRepository.setClaimed(userId, today);
};

const getDailyStats = async (userId) => {
    return await dailyStatsRepository.findWeeklyStats(userId);
};

module.exports = {
    populateDailyStats,
    getDailyStats,
};