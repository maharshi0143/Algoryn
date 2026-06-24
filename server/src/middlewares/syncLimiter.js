const rateLimit = require("express-rate-limit");

const syncLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        data: null,
        message: "Too many sync requests. Please try again later."
    }
});

module.exports = syncLimiter;