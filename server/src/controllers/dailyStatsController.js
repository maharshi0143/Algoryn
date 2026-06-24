const dailyStatsService = require("../services/dailyStatsService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

const populateDailyStats = asyncHandler(async (req, res) => {
    const stats = await dailyStatsService.populateDailyStats(req.user.id);
    apiResponse(res, HTTP_STATUS.OK, "Daily stats populated successfully", stats);
});

const getDailyStats = asyncHandler(async (req, res) => {
    const stats = await dailyStatsService.getDailyStats(req.user.id);
    apiResponse(res, HTTP_STATUS.OK, "Daily stats fetched successfully", stats);
});

module.exports = {
    populateDailyStats,
    getDailyStats,
};