const goalRepository = require("../repositories/goalRepository");
const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");

const createGoal = async (userId, target, month, year) => {
    return await goalRepository.createGoal(userId, target, month, year);
};

const getGoals = async (userId) => {
    return await goalRepository.findGoalsByUserId(userId);
};

const getGoalById = async (userId, goalId) => {
    const goal = await goalRepository.findGoalById(goalId);

    if (!goal) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Goal not found");
    }

    if (goal.user_id !== userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    return goal;
};

const updateGoalProgress = async (userId, goalId, currentProgress) => {
    await getGoalById(userId, goalId);
    return await goalRepository.updateGoalProgress(goalId, currentProgress);
};

const removeGoal = async (userId, goalId) => {
    await getGoalById(userId, goalId);
    await goalRepository.deleteGoal(goalId);
};

module.exports = {
    createGoal,
    getGoals,
    getGoalById,
    updateGoalProgress,
    removeGoal,
};
