const goalService = require("../services/goalService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

const createGoal = asyncHandler(async (req, res) => {
    const { target, month, year } = req.body;
    const goal = await goalService.createGoal(req.user.id, target, month, year);
    apiResponse(res, HTTP_STATUS.CREATED, "Goal created successfully", goal);
});

const getGoals = asyncHandler(async (req, res) => {
    const goals = await goalService.getGoals(req.user.id);
    apiResponse(res, HTTP_STATUS.OK, "Goals fetched successfully", goals);
});

const getGoalById = asyncHandler(async (req, res) => {
    const goal = await goalService.getGoalById(req.user.id, req.params.id);
    apiResponse(res, HTTP_STATUS.OK, "Goal fetched successfully", goal);
});

const updateGoalProgress = asyncHandler(async (req, res) => {
    const { current_progress } = req.body;
    const goal = await goalService.updateGoalProgress(req.user.id, req.params.id, current_progress);
    apiResponse(res, HTTP_STATUS.OK, "Goal updated successfully", goal);
});

const deleteGoal = asyncHandler(async (req, res) => {
    await goalService.removeGoal(req.user.id, req.params.id);
    apiResponse(res, HTTP_STATUS.OK, "Goal deleted successfully");
});

module.exports = {
    createGoal,
    getGoals,
    getGoalById,
    updateGoalProgress,
    deleteGoal,
};
