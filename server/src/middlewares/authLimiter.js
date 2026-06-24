const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    message: {
        success: false,
        data: null,
        message: "Too many authentication attempts. Please try again later."
    }
});

module.exports = authLimiter;