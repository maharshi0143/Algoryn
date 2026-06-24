const cron = require("node-cron");
const logger = require("../utils/logger");
const { track } = require("../utils/cronTracker");

const userRepository = require("../repositories/userRepository");
const weeklyReportService = require("../services/weeklyReportService");
const notificationService = require("../services/notificationService");

const weeklyReportJob = () => {
    const task = cron.schedule("0 9 * * 1", async () => {
        logger.info("Running weekly report job...");

        try {
            const users = await userRepository.findAllUsers();

            for (const user of users) {
                try {
                    await weeklyReportService.generateWeeklyReport(user.id);

                    await notificationService.sendNotification(
                        user.id,
                        "weekly_report",
                        "Your weekly report is ready"
                    );
                } catch (error) {
                    logger.error(`Weekly report failed for ${user.email}`, error);
                }
            }
        } catch (error) {
            logger.error("Weekly report job failed", error);
        }
    });

    track(task);
};

module.exports = weeklyReportJob;
