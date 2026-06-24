const express = require("express");

const notificationController = require("../controllers/notificationController");
const { createNotificationValidator } = require("../validators/notificationValidator");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Notification routes — create, list, mark as read, delete
router.post("/", protect, createNotificationValidator, validate, notificationController.sendNotification);
router.get("/", protect, notificationController.getNotifications);
router.patch("/:id", protect, notificationController.markAsRead);
router.delete("/:id", protect, notificationController.deleteNotification);

module.exports = router;
