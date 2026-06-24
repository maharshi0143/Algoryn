const { body } = require("express-validator");

const sendFriendRequestValidator = [
    body("friendEmail")
        .trim()
        .notEmpty()
        .withMessage("Friend email is required")
        .isEmail()
        .withMessage("Invalid email"),
];

module.exports = {
    sendFriendRequestValidator,
};
