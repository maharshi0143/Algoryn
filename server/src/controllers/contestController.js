const contestService = require("../services/contestService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

// Get contest history for the authenticated user
const getContestHistory = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const result = await contestService.getContestHistory(req.user.id, page, limit);

    apiResponse(res, HTTP_STATUS.OK, "Contest history fetched successfully", result);
});

// Get upcoming contests across all platforms
const getUpcomingContests = asyncHandler(async (req, res) => {
    const contests = await contestService.getUpcomingContests();

    apiResponse(res, HTTP_STATUS.OK, "Upcoming contests fetched successfully", contests);
});

// Get rating graph data for the authenticated user
const getRatingGraph = asyncHandler(async (req, res) => {
    const graph = await contestService.getRatingGraph(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Rating graph fetched successfully", graph);
});

const syncContestHistory = asyncHandler(async (req, res) => {
    await contestService.syncContestHistory(req.user.id);
    apiResponse(res, HTTP_STATUS.OK, "Contest history synced successfully");
});

module.exports = {
    getContestHistory,
    getUpcomingContests,
    getRatingGraph,
    syncContestHistory,
};