const express = require("express");

const authController = require("../controllers/authController");
const { registerValidator, loginValidator, changePasswordValidator } = require("../validators/authValidator");
const { protect } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const authLimiter = require("../middlewares/authLimiter");

const router = express.Router();

// Auth routes — register, login, logout, me, refresh-token, password, delete
router.post("/register", authLimiter, registerValidator, validate, authController.register);
router.post("/login", authLimiter, loginValidator, validate, authController.login);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.me);
router.post("/refresh-token", authLimiter, authController.refreshToken);
router.put("/password", protect, authLimiter, changePasswordValidator, validate, authController.changePassword);
router.delete("/me", protect, authLimiter, authController.deleteAccount);

module.exports = router;
