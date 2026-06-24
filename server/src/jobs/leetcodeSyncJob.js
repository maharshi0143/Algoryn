const cron = require("node-cron");
const logger = require("../utils/logger");
const { track } = require("../utils/cronTracker");

const userRepository = require("../repositories/userRepository");
const profileRepository = require("../repositories/profileRepository");
const syncService = require("../services/syncService");

const leetcodeSyncJob = () => {
    const task = cron.schedule("0 */6 * * *", async () => {
        logger.info("Running LeetCode sync job...");

        try {
            const users = await userRepository.findAllUsers();

            for (const user of users) {
                const profile = await profileRepository.findByUserAndPlatform(user.id, "leetcode");

                if (!profile) continue;

                try {
                    await syncService.syncLeetCode(user.id);
                } catch (error) {
                    logger.error(`LeetCode sync failed for ${user.email}`, error);
                }
            }
        } catch (error) {
            logger.error("LeetCode sync job failed", error);
        }
    });

    track(task);
};

module.exports = leetcodeSyncJob;
