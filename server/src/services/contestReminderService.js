const contestReminderRepository = require("../repositories/contestReminderRepository");
const notificationService = require("./notificationService");
const notificationRepository = require("../repositories/notificationRepository");
const { fetchCodeforcesUpcomingContests } = require("../integrations/codeforces/codeforcesService");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const HTTP_STATUS = require("../constants/httpStatus");

const createReminder = async (userId, platform, minutesBefore) => {
    return await contestReminderRepository.createReminder(userId, platform, minutesBefore);
};

const getReminders = async (userId) => {
    return await contestReminderRepository.findRemindersByUserId(userId);
};

const deleteReminder = async (userId, reminderId) => {
    const reminder = await contestReminderRepository.findReminderById(reminderId);

    if (!reminder) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reminder not found");
    }

    if (reminder.user_id !== userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    await contestReminderRepository.deleteReminder(reminderId);
};

const checkUpcomingContests = async () => {
    const reminders = await contestReminderRepository.findActiveReminders();
    if (reminders.length === 0) return;

    let upcoming = [];

    try {
        upcoming = await fetchCodeforcesUpcomingContests();
    } catch {
        logger.error("Failed to fetch upcoming contests");
        return;
    }

    const now = new Date();

    for (const reminder of reminders) {
        const match = upcoming.find(c =>
            c.platform === reminder.platform &&
            new Date(c.startTime) - now <= reminder.minutes_before * 60 * 1000 &&
            new Date(c.startTime) > now
        );

        if (!match) continue;

        const recentNotifications = await notificationRepository.findByUserIdAndTypeSince(
            reminder.user_id, "contest", new Date(Date.now() - 3600000)
        );

        const alreadyNotified = recentNotifications.some(n =>
            n.message.includes(match.contestName)
        );

        if (alreadyNotified) continue;

        await notificationService.sendNotification(
            reminder.user_id,
            "contest",
            `${match.contestName} on ${reminder.platform} starts in less than ${reminder.minutes_before} minutes!`
        );
    }
};

module.exports = {
    createReminder,
    getReminders,
    deleteReminder,
    checkUpcomingContests,
};