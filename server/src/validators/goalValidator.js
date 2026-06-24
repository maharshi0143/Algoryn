const { body } = require("express-validator");

const createGoalValidator = [
    body("target")
        .isInt({ min: 1 })
        .withMessage("Target must be greater than 0"),

    body("month")
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage("Month must be between 1 and 12"),

    body("year")
        .optional()
        .isInt({ min: 2025 })
        .withMessage("Year must be 2025 or later"),
];

const updateGoalValidator = [
    body("current_progress")
        .isInt({ min: 0 })
        .withMessage("Current progress must be 0 or greater"),
];

module.exports = {
    createGoalValidator,
    updateGoalValidator,
};
