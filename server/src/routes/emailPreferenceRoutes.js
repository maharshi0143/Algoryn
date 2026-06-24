const express = require("express");
const { body } = require("express-validator");

const emailPreferenceController = require("../controllers/emailPreferenceController");
const { protect } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");

const router = express.Router();

router.get("/", protect, emailPreferenceController.getPreferences);
router.put("/", protect, [
    body("weekly_report").optional().isBoolean().withMessage("weekly_report must be a boolean"),
    body("contest_reminder").optional().isBoolean().withMessage("contest_reminder must be a boolean"),
    body("streak_alert").optional().isBoolean().withMessage("streak_alert must be a boolean"),
    body("achievement_alert").optional().isBoolean().withMessage("achievement_alert must be a boolean"),
], validate, emailPreferenceController.updatePreferences);

module.exports = router;
