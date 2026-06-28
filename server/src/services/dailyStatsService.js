const dashboardService = require("./dashboardService");
const dailyStatsRepository = require("../repositories/dailyStatsRepository");
const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");

const populateDailyStats = async (userId) => {
    const today = new Date().toISOString().split("T")[0];

    const overview = await dashboardService.getOverview(userId);

    const todayCumulative = Number(overview.totalSolved ?? 0);

    if (todayCumulative === 0) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Solve some problems first before claiming XP");
    }

    if (overview.claimed) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "You already claimed XP today");
    }

    // Compute daily delta: difference from last known cumulative total
    const prev = await dailyStatsRepository.findLatestBeforeDate(userId, today);
    const prevCumulative = Number(prev?.cumulative_total ?? 0);
    const delta = Math.max(0, todayCumulative - prevCumulative);

    await dailyStatsRepository.upsertDailyStats(
        userId,
        today,
        delta,
        Number(overview.easy) || 0,
        Number(overview.medium) || 0,
        Number(overview.hard) || 0,
        Number(overview.contributions) || 0,
        todayCumulative,
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