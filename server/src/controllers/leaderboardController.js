const leaderboardService = require("../services/leaderboardService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

const getGlobalLeaderboard = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 50));
    const leaderboard = await leaderboardService.getGlobalLeaderboard(page, limit);

    apiResponse(res, HTTP_STATUS.OK, "Global leaderboard fetched successfully", leaderboard);
});

const getFriendsLeaderboard = asyncHandler(async (req, res) => {
    const leaderboard = await leaderboardService.getFriendsLeaderboard(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Friends leaderboard fetched successfully", leaderboard);
});

const getPlatformLeaderboard = asyncHandler(async (req, res) => {
    const leaderboard = await leaderboardService.getPlatformLeaderboard(req.params.platform);

    apiResponse(res, HTTP_STATUS.OK, "Platform leaderboard fetched successfully", leaderboard);
});

const getTopStreaks = asyncHandler(async (req, res) => {
    const leaderboard = await leaderboardService.getTopStreaks();

    apiResponse(res, HTTP_STATUS.OK, "Top streaks fetched successfully", leaderboard);
});

const getTopContributors = asyncHandler(async (req, res) => {
    const leaderboard = await leaderboardService.getTopContributors();

    apiResponse(res, HTTP_STATUS.OK, "Top contributors fetched successfully", leaderboard);
});

module.exports = {
    getGlobalLeaderboard,
    getFriendsLeaderboard,
    getPlatformLeaderboard,
    getTopStreaks,
    getTopContributors,
};