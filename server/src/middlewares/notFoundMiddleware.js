const HTTP_STATUS = require("../constants/httpStatus");

// Handle 404 — catch-all for unmatched routes
const notFoundMiddleware = (req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        data: null,
        message: `Route ${req.originalUrl} not found`,
    });
};

module.exports = notFoundMiddleware;
