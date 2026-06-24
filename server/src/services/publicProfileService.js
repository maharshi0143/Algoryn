const publicProfileRepository = require("../repositories/publicProfileRepository");
const dashboardService = require("./dashboardService");
const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");

const getPublicProfile = async (username) => {
    const user = await publicProfileRepository.findUserByUsername(username);

    if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    const [profiles, achievements, activities, stats] = await Promise.all([
        publicProfileRepository.findCodingProfiles(user.id),
        publicProfileRepository.findAchievements(user.id),
        publicProfileRepository.findActivities(user.id),
        dashboardService.getOverview(user.id),
    ]);

    return {
        user: {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            bio: user.bio,
        },
        stats,
        profiles,
        achievements,
        activities,
    };
};

module.exports = {
    getPublicProfile,
};