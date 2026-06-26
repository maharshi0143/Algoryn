const ApiError = require("../utils/ApiError");
const authService = require("../services/authService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

// Register a new user
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const data = await authService.registerUser(name, email, password);

    res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete data.refreshToken;

    apiResponse(
        res,
        HTTP_STATUS.CREATED,
        "Registration successful. Please verify your email.",
        data
    );
});

// Login with email and password
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const data = await authService.loginUser(email, password);

    res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete data.refreshToken;

    apiResponse(res, HTTP_STATUS.OK, "Login successful", data);
});

// Logout and clear refresh token
const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        await authService.logoutUser(refreshToken);
    }

    res.clearCookie("refreshToken");

    apiResponse(res, HTTP_STATUS.OK, "Logout successful");
});

// Get the currently authenticated user
const me = asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);

    apiResponse(
        res,
        HTTP_STATUS.OK,
        "User fetched successfully",
        user
    );
});

// Refresh access token using the refresh token cookie
const refreshToken = asyncHandler(async (req, res) => {
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!refreshTokenCookie) {
        throw new ApiError(
            HTTP_STATUS.UNAUTHORIZED,
            "Refresh token not provided"
        );
    }

    const data = await authService.refreshUserToken(refreshTokenCookie);

    res.cookie("refreshToken", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    delete data.refreshToken;

    apiResponse(
        res,
        HTTP_STATUS.OK,
        "Access token refreshed successfully",
        data
    );
});

// Change password for the authenticated user
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
    );

    apiResponse(
        res,
        HTTP_STATUS.OK,
        "Password changed successfully"
    );
});

// Delete the authenticated user's account
const deleteAccount = asyncHandler(async (req, res) => {
    await authService.deleteAccount(req.user.id);

    res.clearCookie("refreshToken");

    apiResponse(
        res,
        HTTP_STATUS.OK,
        "Account deleted successfully"
    );
});

module.exports = {
    register,
    login,
    logout,
    me,
    refreshToken,
    changePassword,
    deleteAccount,
};