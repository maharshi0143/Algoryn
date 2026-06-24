const HTTP_STATUS = require("../constants/httpStatus");
const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
    const isSyntaxError = err.type === "entity.parse.failed";
    const isPayloadTooLarge = err.type === "entity.too.large";

    if (isSyntaxError) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false, data: null, message: "Invalid JSON in request body",
        });
    }

    if (isPayloadTooLarge) {
        return res.status(HTTP_STATUS.PAYLOAD_TOO_LARGE).json({
            success: false, data: null, message: "Request body too large",
        });
    }

    const statusCode = err.statusCode || err.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;

    if (statusCode >= 500) {
        logger.error(err.stack || err.message);
    }

    res.status(statusCode).json({
        success: false,
        data: null,
        message: err.message || "Internal Server Error",
    });
};

module.exports = errorMiddleware;
