const rateLimit = require("express-rate-limit");

const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        data: null,
        message: "Too many AI requests. Please try again later."
    }
});

module.exports = aiLimiter;