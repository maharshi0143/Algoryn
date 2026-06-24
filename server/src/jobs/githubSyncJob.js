const cron = require("node-cron");
const logger = require("../utils/logger");
const { track } = require("../utils/cronTracker");

const userRepository = require("../repositories/userRepository");
const profileRepository = require("../repositories/profileRepository");
const syncService = require("../services/syncService");

const githubSyncJob = () => {
    const task = cron.schedule("0 */6 * * *", async () => {
        logger.info("Running GitHub sync job...");

        try {
            const users = await userRepository.findAllUsers();

            for (const user of users) {
                const githubProfile = await profileRepository.findByUserAndPlatform(user.id, "github");

                if (!githubProfile) continue;

                try {
                    await syncService.syncGithub(user.id);
                } catch (error) {
                    logger.error(`GitHub sync failed for ${user.email}`, error);
                }
            }
        } catch (error) {
            logger.error("GitHub sync job failed", error);
        }
    });

    track(task);
};

module.exports = githubSyncJob;
