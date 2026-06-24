const notificationService = require("../services/notificationService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

// Create a notification for the authenticated user
const sendNotification = asyncHandler(async (req, res) => {
    const { type, message } = req.body;
    const notification = await notificationService.sendNotification(req.user.id, type, message);

    apiResponse(res, HTTP_STATUS.CREATED, "Notification sent successfully", notification);
});

// Get all notifications for the authenticated user
const getNotifications = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const result = await notificationService.getNotifications(req.user.id, page, limit);

    apiResponse(res, HTTP_STATUS.OK, "Notifications fetched successfully", result);
});

// Mark a notification as read
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markNotificationAsRead(req.user.id, req.params.id);

    apiResponse(res, HTTP_STATUS.OK, "Notification marked as read", notification);
});

// Delete a notification
const deleteNotification = asyncHandler(async (req, res) => {
    await notificationService.removeNotification(req.user.id, req.params.id);

    apiResponse(res, HTTP_STATUS.OK, "Notification deleted successfully");
});

module.exports = {
    sendNotification,
    getNotifications,
    markAsRead,
    deleteNotification,
};
