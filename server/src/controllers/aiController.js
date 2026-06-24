const aiService = require("../services/aiService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

const getInsights = asyncHandler(async (req, res) => {
    const data = await aiService.getInsights(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Insights generated successfully", data);
});

const getRecommendations = asyncHandler(async (req, res) => {
    const data = await aiService.getRecommendations(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Recommendations generated successfully", data);
});

const getWeakness = asyncHandler(async (req, res) => {
    const data = await aiService.getWeakness(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Weakness analysis generated successfully", data);
});

module.exports = {
    getInsights,
    getRecommendations,
    getWeakness,
};
