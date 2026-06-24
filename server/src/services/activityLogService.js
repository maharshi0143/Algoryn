const activityLogRepository = require("../repositories/activityLogRepository");

const logActivity = async (userId, action, description) => {
    return await activityLogRepository.createActivityLog(userId, action, description);
};

const getRecentActivities = async (userId, limit = 20) => {
    return await activityLogRepository.findActivitiesByUserId(userId, limit);
};

module.exports = {
    logActivity,
    getRecentActivities,
};