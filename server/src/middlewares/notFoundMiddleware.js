// Handle 404 — catch-all for unmatched routes
const notFoundMiddleware = (req, res) => {
    res.status(404).json({
        success: false,
        data: null,
        message: `Route ${req.originalUrl} not found`,
    });
};

module.exports = notFoundMiddleware;
