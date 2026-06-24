const cron = require("node-cron");
const logger = require("../utils/logger");
const { track } = require("../utils/cronTracker");

const contestReminderService = require("../services/contestReminderService");

const contestReminderJob = () => {
    const task = cron.schedule("*/5 * * * *", async () => {
        logger.info("Running contest reminder job...");

        try {
            await contestReminderService.checkUpcomingContests();
        } catch (error) {
            logger.error("Contest reminder job failed", error);
        }
    });

    track(task);
};

module.exports = contestReminderJob;
