const cron = require("node-cron");
const logger = require("../utils/logger");
const { track } = require("../utils/cronTracker");
const { withLock } = require("../utils/jobTracker");
const userRepository = require("../repositories/userRepository");
const profileRepository = require("../repositories/profileRepository");
const syncService = require("../services/syncService");

const codeforcesSyncJob = () => {
    const task = cron.schedule("0 */6 * * *", withLock("codeforces-sync", async () => {
        logger.info("Running Codeforces sync job...");

        try {
            const users = await userRepository.findAllUsers();

            for (const user of users) {
                const profile = await profileRepository.findByUserAndPlatform(user.id, "codeforces");

                if (!profile) continue;

                try {
                    await syncService.syncCodeforces(user.id);
                } catch (error) {
                    logger.error(`Codeforces sync failed for ${user.email}`, error);
                }
            }
        } catch (error) {
            logger.error("Codeforces sync job failed", error);
        }
    });

    track(task);
};

module.exports = codeforcesSyncJob;
