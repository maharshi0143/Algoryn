const cron = require("node-cron");
const logger = require("../utils/logger");
const { track } = require("../utils/cronTracker");
const { withLock } = require("../utils/jobTracker");
const userRepository = require("../repositories/userRepository");
const profileRepository = require("../repositories/profileRepository");
const syncService = require("../services/syncService");

const codechefSyncJob = () => {
    const task = cron.schedule("0 */6 * * *", withLock("codechef-sync", async () => {
        logger.info("Running CodeChef sync job...");

        try {
            const users = await userRepository.findAllUsers();

            for (const user of users) {
                const profile = await profileRepository.findByUserAndPlatform(user.id, "codechef");

                if (!profile) continue;

                try {
                    await syncService.syncCodeChef(user.id);
                } catch (error) {
                    logger.error(`CodeChef sync failed for ${user.email}`, error);
                }
            }
        } catch (error) {
            logger.error("CodeChef sync job failed", error);
        }
    });

    track(task);
};

module.exports = codechefSyncJob;
