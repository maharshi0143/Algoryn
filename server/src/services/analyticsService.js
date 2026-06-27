const analyticsRepository = require("../repositories/analyticsRepository");

// Get problem-solving breakdown by platform
const getPlatformComparison = async (userId) => {
    return await analyticsRepository.getPlatformComparison(userId);
};

// Get problem counts grouped by difficulty
const getDifficultyDistribution = async (userId) => {
    const stats = await analyticsRepository.getDifficultyDistribution(userId);

    return {
        easy: Number(stats?.easy ?? 0),
        medium: Number(stats?.medium ?? 0),
        hard: Number(stats?.hard ?? 0),
    };
};

// Get daily GitHub contribution history
const getContributionTrend = async (userId) => {
    return await analyticsRepository.getContributionTrend(userId);
};

// Get monthly problem-solving progress for the current year
const getYearlyProgress = async (userId) => {
    return await analyticsRepository.getYearlyProgress(userId);
};

// Get language distribution from GitHub
const getLanguageDistribution = async (userId) => {
    return await analyticsRepository.getLanguageDistribution(userId);
};

module.exports = {
    getPlatformComparison,
    getDifficultyDistribution,
    getContributionTrend,
    getYearlyProgress,
    getLanguageDistribution,
};
