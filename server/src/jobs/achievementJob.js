const cron = require("node-cron");
const logger = require("../utils/logger");
const { track } = require("../utils/cronTracker");

const userRepository = require("../repositories/userRepository");
const achievementService = require("../services/achievementService");

const achievementJob = () => {
    const task = cron.schedule("0 0 * * *", async () => {
        logger.info("Running achievement job...");

        try {
            const users = await userRepository.findAllUsers();

            for (const user of users) {
                try {
                    await achievementService.checkAchievements(user.id);
                } catch (error) {
                    logger.error(`Achievement check failed for ${user.email}`, error);
                }
            }
        } catch (error) {
            logger.error("Achievement job failed", error);
        }
    });

    track(task);
};

module.exports = achievementJob;
