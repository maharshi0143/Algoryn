const { body } = require("express-validator");

// Validation rules for user registration
const registerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email")
        .normalizeEmail()
        .custom((value) => {
            if (!value.endsWith("@gmail.com")) {
                throw new Error("Only Gmail addresses (@gmail.com) are allowed");
            }
            return true;
        }),

    body("password")
        .isString()
        .withMessage("Password must be a string")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
];

// Validation rules for user login
const loginValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email")
        .normalizeEmail()
        .custom((value) => {
            if (!value.endsWith("@gmail.com")) {
                throw new Error("Only Gmail addresses (@gmail.com) are allowed");
            }
            return true;
        }),

    body("password")
        .isString()
        .withMessage("Password must be a string")
        .notEmpty()
        .withMessage("Password is required"),
];

const changePasswordValidator = [
    body("currentPassword")
        .isString()
        .withMessage("Current password must be a string")
        .notEmpty()
        .withMessage("Current password is required"),

    body("newPassword")
        .isString()
        .withMessage("New password must be a string")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
];

module.exports = {
    registerValidator,
    loginValidator,
    changePasswordValidator,
};
