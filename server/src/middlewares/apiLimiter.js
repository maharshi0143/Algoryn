const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        data: null,
        message: "Too many requests. Please try again later.",
    },
});

module.exports = apiLimiter;