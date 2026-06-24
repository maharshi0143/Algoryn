const { body } = require("express-validator");

const NOTIFICATION_TYPES = ["achievement", "contest", "weekly_report", "streak", "sync"];

// Validation rules for creating a notification
const createNotificationValidator = [
    body("type")
        .trim()
        .notEmpty()
        .withMessage("Type is required")
        .isIn(NOTIFICATION_TYPES)
        .withMessage("Invalid notification type"),

    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message is required"),
];

module.exports = {
    createNotificationValidator,
};
