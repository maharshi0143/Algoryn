const dashboardService = require("../services/dashboardService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

// Get combined overview of problem stats and GitHub stats
const getOverview = asyncHandler(async (req, res) => {
    const overview = await dashboardService.getOverview(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Dashboard overview fetched successfully", overview);
});

// Get daily stats for the last 7 days
const getWeeklyStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getWeeklyStats(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Weekly stats fetched successfully", stats);
});

// Get daily stats for the last 30 days
const getMonthlyStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getMonthlyStats(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Monthly stats fetched successfully", stats);
});

// Get all daily stats for heatmap
const getHeatmapStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getHeatmapStats(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Heatmap stats fetched successfully", stats);
});

// Get combined chart data
const getCharts = asyncHandler(async (req, res) => {
    const charts = await dashboardService.getCharts(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Chart data fetched successfully", charts);
});

module.exports = {
    getOverview,
    getWeeklyStats,
    getMonthlyStats,
    getHeatmapStats,
    getCharts,
};
