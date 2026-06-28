const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");
const logger = require("../utils/logger");

const generateAccessToken = require("../utils/generateAccessToken");
const generateRefreshToken = require("../utils/generateRefreshToken");

const userRepository = require("../repositories/userRepository");
const refreshTokenRepository = require("../repositories/refreshTokenRepository");

const registerUser = async (name, email, password) => {
    const existingUser = await userRepository.findUserByEmail(email);

    if (existingUser) {
        throw new ApiError(HTTP_STATUS.CONFLICT, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await userRepository.createUser(name, email, hashedPassword);

    const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
};

const loginUser = async (email, password) => {
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
    }

    const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        accessToken,
        refreshToken,
    };
};

const logoutUser = async (refreshToken) => {
    await refreshTokenRepository.deleteRefreshToken(refreshToken);
};

const getCurrentUser = async (userId) => {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    return user;
};

const refreshUserToken = async (refreshToken) => {
    const storedToken = await refreshTokenRepository.findRefreshToken(refreshToken);

    if (!storedToken) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid refresh token");
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Expired refresh token");
    }

    const accessToken = generateAccessToken({ userId: decoded.userId });
    const newRefreshToken = generateRefreshToken({ userId: decoded.userId });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    try {
        await refreshTokenRepository.deleteRefreshToken(refreshToken);
    } catch (error) {
        logger.error("Failed to delete old refresh token", error);
    }
    await refreshTokenRepository.saveRefreshToken(decoded.userId, newRefreshToken, expiresAt);

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
};

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await userRepository.findUserByIdForAuth(userId);

    if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await userRepository.updatePassword(userId, hashedPassword);
};

const deleteAccount = async (userId) => {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    await userRepository.deleteUser(userId);
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshUserToken,
    changePassword,
    deleteAccount,
};
