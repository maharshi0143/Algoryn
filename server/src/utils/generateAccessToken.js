const jwt = require("jsonwebtoken");

// Generate a short-lived JWT access token
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
};

module.exports = generateAccessToken;
