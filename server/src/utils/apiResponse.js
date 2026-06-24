// Send a standardized API response
const apiResponse = (res, statusCode, message, data = null) => {
    const success = statusCode >= 200 && statusCode < 300;

    res.status(statusCode).json({
        success,
        message,
        data,
    });
};

module.exports = apiResponse;
