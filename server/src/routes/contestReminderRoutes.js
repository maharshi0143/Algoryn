const express = require("express");

const contestReminderController = require("../controllers/contestReminderController");
const { createReminderValidator } = require("../validators/contestReminderValidator");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, createReminderValidator, validate, contestReminderController.createReminder);
router.get("/", protect, contestReminderController.getReminders);
router.delete("/:id", protect, contestReminderController.deleteReminder);

module.exports = router;