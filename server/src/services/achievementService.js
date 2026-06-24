const achievementRepository = require("../repositories/achievementRepository");
const dashboardService = require("./dashboardService");
const notificationService = require("./notificationService");

// Unlock an achievement for a user (no-op if already unlocked)
const unlockAchievement = async (userId, type, title, description, icon) => {
    const existingAchievement = await achievementRepository.findAchievementByTitle(userId, title);

    if (existingAchievement) {
        return null;
    }

    const achievement = await achievementRepository.createAchievement(userId, type, title, description, icon);

    await notificationService.sendNotification(userId, "achievement", `${title} unlocked`);

    return achievement;
};

// Get all achievements for a user
const getAchievements = async (userId) => {
    return await achievementRepository.findAchievementsByUserId(userId);
};

// Check and unlock any new achievements based on current stats
const checkAchievements = async (userId) => {
    const stats = await dashboardService.getOverview(userId);

    const unlockedAchievements = [];

    if (stats.totalSolved >= 100) {
        const achievement = await unlockAchievement(userId, "problem", "Problem Solver", "Solved 100 problems", "🥉");
        if (achievement) unlockedAchievements.push(achievement);
    }

    if (stats.totalSolved >= 500) {
        const achievement = await unlockAchievement(userId, "problem", "Advanced Problem Solver", "Solved 500 problems", "🥈");
        if (achievement) unlockedAchievements.push(achievement);
    }

    if (stats.totalSolved >= 1000) {
        const achievement = await unlockAchievement(userId, "problem", "Problem Master", "Solved 1000 problems", "🥇");
        if (achievement) unlockedAchievements.push(achievement);
    }

    if (stats.streak >= 7) {
        const achievement = await unlockAchievement(userId, "streak", "7-Day Streak", "Maintained a 7 day streak", "🔥");
        if (achievement) unlockedAchievements.push(achievement);
    }

    if (stats.contributions >= 100) {
        const achievement = await unlockAchievement(userId, "contribution", "GitHub Explorer", "Reached 100 contributions", "⭐");
        if (achievement) unlockedAchievements.push(achievement);
    }

    return unlockedAchievements;
};

module.exports = {
    getAchievements,
    checkAchievements,
};
