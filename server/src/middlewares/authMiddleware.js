const jwt = require("jsonwebtoken");

const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");

const userRepository = require("../repositories/userRepository");

// Verify JWT access token and attach user to request
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.userId) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid token payload");
        }

        const user = await userRepository.findUserById(decoded.userId);

        if (!user) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "User not found");
        }

        if (user.is_active === false) {
            throw new ApiError(HTTP_STATUS.FORBIDDEN, "Account has been deactivated");
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    protect,
};
