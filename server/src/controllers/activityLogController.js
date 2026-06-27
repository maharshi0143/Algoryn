const activityLogService = require("../services/activityLogService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

const getRecentActivities = asyncHandler(async (req, res) => {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const activities = await activityLogService.getRecentActivities(req.user.id, limit);
    apiResponse(res, HTTP_STATUS.OK, "Activities fetched successfully", activities);
});

module.exports = {
    getRecentActivities,
};
