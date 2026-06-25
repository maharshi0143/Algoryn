const { body } = require("express-validator");

const createReminderValidator = [
    body("platform")
        .trim()
        .notEmpty()
        .withMessage("Platform is required")
        .isIn(["leetcode", "github", "codechef", "codeforces", "gfg", "hackerrank"])
        .withMessage("Invalid platform"),

    body("minutes_before")
        .isInt({ min: 10, max: 60 })
        .withMessage("minutes_before must be between 10 and 60"),
];

module.exports = {
    createReminderValidator,
};