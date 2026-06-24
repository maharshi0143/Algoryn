const activeEnv = process.env.NODE_ENV || "development";
require("dotenv").config({ path: require("path").resolve(__dirname, "..", `.env.${activeEnv}`) });

const http = require("http");
const Sentry = require("@sentry/node");
const logger = require("./utils/logger");
const { stopAll } = require("./utils/cronTracker");

const app = require("./app");
const { pool, waitForDatabase } = require("./config/db");
const { initializeSocket } = require("./config/socket");
const initializeJobs = require("./jobs");

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        await waitForDatabase();
    } catch (error) {
        logger.error("Failed to connect to database, exiting:", error);
        process.exit(1);
    }

    try {
        initializeJobs();
    } catch (error) {
        logger.error("Failed to initialize jobs:", error);
    }

    const server = http.createServer(app);

    initializeSocket(server);

    server.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
};

start();

const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received: closing server...`);

    stopAll();

    server.close(async () => {
        const { getIO } = require("./config/socket");
        try {
            const io = getIO();
            io.close();
        } catch { }

        try {
            await pool.end();
        } catch { }

        logger.info("Server closed");
        process.exit(0);
    });

    setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
    }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
    Sentry.captureException(reason);
    logger.error("Unhandled Rejection:", reason);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    Sentry.captureException(error);
    logger.error("Uncaught Exception:", error);
    process.exit(1);
});
