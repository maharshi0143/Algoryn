const cron = require("node-cron");
const logger = require("../utils/logger");
const { track } = require("../utils/cronTracker");

const userRepository = require("../repositories/userRepository");
const dailyStatsService = require("../services/dailyStatsService");

const dailyStatsJob = () => {
    const task = cron.schedule("0 0 * * *", async () => {
        logger.info("Running daily stats job...");

        try {
            const users = await userRepository.findAllUsers();

            for (const user of users) {
                try {
                    await dailyStatsService.populateDailyStats(user.id);
                } catch (error) {
                    logger.error(`Daily stats failed for ${user.email}`, error);
                }
            }
        } catch (error) {
            logger.error("Daily stats job failed", error);
        }
    });

    track(task);
};

module.exports = dailyStatsJob;
