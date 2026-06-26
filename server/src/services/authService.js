const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");
const logger = require("../utils/logger");

const generateAccessToken = require("../utils/generateAccessToken");
const generateRefreshToken = require("../utils/generateRefreshToken");
const { generateVerificationToken } = require("../utils/verificationToken");
const { sendVerificationEmail } = require("./emailService");


const userRepository = require("../repositories/userRepository");
const refreshTokenRepository = require("../repositories/refreshTokenRepository");

// Register a new user and return tokens
const registerUser = async (name, email, password) => {
    const existingUser = await userRepository.findUserByEmail(email);

    if (existingUser) {
        throw new ApiError(HTTP_STATUS.CONFLICT, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const {
        token,
        tokenHash,
        expiresAt: verificationTokenExpiresAt,
    } = generateVerificationToken();

    const user = await userRepository.createUser(
        name,
        email,
        hashedPassword,
        tokenHash,
        verificationTokenExpiresAt
    );

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

    const frontendUrl = process.env.CLIENT_URL?.split(",")[0]?.trim() || "http://localhost:5173";
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    try {
        sendVerificationEmail(
            user.email,
            user.name,
            verificationUrl
        );
    } catch (err) {
        logger.error(`Failed to send verification email to ${user.email}: ${err.message}`);
    }

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

// Login with email and password, return tokens
const loginUser = async (email, password) => {
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
    }

    if (!user.is_verified) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "Please verify your email before logging in."
        );
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

// Logout by deleting the refresh token
const logoutUser = async (refreshToken) => {
    await refreshTokenRepository.deleteRefreshToken(refreshToken);
};

// Get the currently authenticated user's details
const getCurrentUser = async (userId) => {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    return user;
};

// Rotate refresh token and issue a new access token
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

    await refreshTokenRepository.saveRefreshToken(decoded.userId, newRefreshToken, expiresAt);
    try {
        await refreshTokenRepository.deleteRefreshToken(refreshToken);
    } catch (error) {
        logger.error("Failed to delete old refresh token", error);
    }

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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userRepository.updatePassword(userId, hashedPassword);
};

const deleteAccount = async (userId) => {
    const user = await userRepository.findUserById(userId);

    if (!user) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    await userRepository.deleteUser(userId);
};

const verifyEmail = async (token) => {
    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await userRepository.findUserByVerificationTokenHash(
        tokenHash
    );

    if (!user) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            "Invalid or expired verification link."
        );
    }

    await userRepository.verifyUserEmail(user.id);

    return {
        message: "Email verified successfully.",
    };
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    refreshUserToken,
    changePassword,
    deleteAccount,
    verifyEmail
};
