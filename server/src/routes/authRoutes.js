const express = require("express");

const authController = require("../controllers/authController");
const {
    registerValidator,
    loginValidator,
    changePasswordValidator,
} = require("../validators/authValidator");

const { protect } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const authLimiter = require("../middlewares/authLimiter");

const router = express.Router();

// ======================
// Authentication Routes
// ======================

// Register
router.post(
    "/register",
    authLimiter,
    registerValidator,
    validate,
    authController.register
);

// Login
router.post(
    "/login",
    authLimiter,
    loginValidator,
    validate,
    authController.login
);

// Logout
router.post(
    "/logout",
    protect,
    authController.logout
);

// Current User
router.get(
    "/me",
    protect,
    authController.me
);

// Refresh Token
router.post(
    "/refresh-token",
    authLimiter,
    authController.refreshToken
);

// Change Password
router.put(
    "/password",
    protect,
    authLimiter,
    changePasswordValidator,
    validate,
    authController.changePassword
);

// Delete Account
router.delete(
    "/me",
    protect,
    authLimiter,
    authController.deleteAccount
);

module.exports = router;