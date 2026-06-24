const { body } = require("express-validator");

// Validation rules for creating a coding profile
const createProfileValidator = [
    body("platform")
        .trim()
        .notEmpty()
        .withMessage("Platform is required")
        .isIn([
            "leetcode",
            "github",
            "codeforces",
            "codechef",
            "gfg",
            "hackerrank",
        ])
        .withMessage("Invalid platform"),

    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required"),
];

// Validation rules for updating a coding profile
const updateProfileValidator = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required"),
    body("profileUrl")
        .optional()
        .trim(),
];

module.exports = {
    createProfileValidator,
    updateProfileValidator,
};
