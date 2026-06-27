const analyticsService = require("../services/analyticsService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

// Get total solved problems grouped by platform
const getPlatformComparison = asyncHandler(async (req, res) => {
    const data = await analyticsService.getPlatformComparison(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Platform comparison fetched successfully", data);
});

// Get problem counts grouped by difficulty
const getDifficultyDistribution = asyncHandler(async (req, res) => {
    const data = await analyticsService.getDifficultyDistribution(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Difficulty distribution fetched successfully", data);
});

// Get daily GitHub contribution history
const getContributionTrend = asyncHandler(async (req, res) => {
    const data = await analyticsService.getContributionTrend(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Contribution trend fetched successfully", data);
});

// Get monthly problem-solving progress for the current year
const getYearlyProgress = asyncHandler(async (req, res) => {
    const data = await analyticsService.getYearlyProgress(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Yearly progress fetched successfully", data);
});

// Get language distribution from GitHub stats
const getLanguageDistribution = asyncHandler(async (req, res) => {
    const data = await analyticsService.getLanguageDistribution(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Language distribution fetched successfully", data);
});

module.exports = {
    getPlatformComparison,
    getDifficultyDistribution,
    getContributionTrend,
    getYearlyProgress,
    getLanguageDistribution,
};
