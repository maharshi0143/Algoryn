const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

const logDir = path.resolve(__dirname, "../../logs");

const isProduction = process.env.NODE_ENV === "production";

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, stack }) =>
        stack ? `${timestamp} [${level}] ${message}\n${stack}` : `${timestamp} [${level}] ${message}`
    ),
);

const jsonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    transports: [
        new winston.transports.Console({
            format: isProduction ? jsonFormat : consoleFormat,
        }),
    ],
});

if (isProduction) {
    logger.add(new DailyRotateFile({
        filename: path.join(logDir, "app-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        maxSize: "10m",
        maxFiles: "30d",
        format: jsonFormat,
        zippedArchive: true,
    }));

    logger.add(new DailyRotateFile({
        filename: path.join(logDir, "error-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        level: "error",
        maxSize: "10m",
        maxFiles: "30d",
        format: jsonFormat,
        zippedArchive: true,
    }));
}

module.exports = logger;
