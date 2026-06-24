const achievementService = require("../services/achievementService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

// Get all achievements for the authenticated user
const getAchievements = asyncHandler(async (req, res) => {
    const achievements = await achievementService.getAchievements(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Achievements fetched successfully", achievements);
});

// Check for newly unlocked achievements based on current stats
const checkAchievements = asyncHandler(async (req, res) => {
    const achievements = await achievementService.checkAchievements(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Achievements checked successfully", achievements);
});

module.exports = {
    getAchievements,
    checkAchievements,
};
