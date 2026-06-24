const leaderboardRepository = require("../repositories/leaderboardRepository");

const getGlobalLeaderboard = async (page = 1, limit = 50) => {
    return await leaderboardRepository.getGlobalLeaderboard(page, limit);
};

const getFriendsLeaderboard = async (userId) => {
    return await leaderboardRepository.getFriendsLeaderboard(userId);
};

const getPlatformLeaderboard = async (platform) => {
    return await leaderboardRepository.getPlatformLeaderboard(platform);
};

const getTopStreaks = async () => {
    return await leaderboardRepository.getTopStreaks();
};

const getTopContributors = async () => {
    return await leaderboardRepository.getTopContributors();
};

module.exports = {
    getGlobalLeaderboard,
    getFriendsLeaderboard,
    getPlatformLeaderboard,
    getTopStreaks,
    getTopContributors,
};