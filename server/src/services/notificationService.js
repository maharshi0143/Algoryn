const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");
const logger = require("../utils/logger");

const notificationRepository = require("../repositories/notificationRepository");
const { getIO } = require("../config/socket");

// Create a notification and emit it via Socket.IO
const sendNotification = async (userId, type, message) => {
    let notification;

    try {
        notification = await notificationRepository.createNotification(userId, type, message);
    } catch (error) {
        logger.error("Failed to save notification", error);
        return null;
    }

    try {
        const io = getIO();
        io.to(userId).emit("notification:new", notification);
    } catch {
        logger.warn("Socket.IO not available, notification saved without real-time emit");
    }

    return notification;
};

// Get all notifications for a user (with pagination)
const getNotifications = async (userId, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    const rows = await notificationRepository.findNotificationsByUserId(userId, limit, offset);
    const total = await notificationRepository.countByUserId(userId);

    return {
        data: rows,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

// Mark a notification as read (with ownership check)
const markNotificationAsRead = async (userId, notificationId) => {
    const notification = await notificationRepository.findNotificationById(notificationId);

    if (!notification) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Notification not found");
    }

    if (notification.user_id !== userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    return await notificationRepository.markAsRead(notificationId);
};

// Delete a notification (with ownership check)
const removeNotification = async (userId, notificationId) => {
    const notification = await notificationRepository.findNotificationById(notificationId);

    if (!notification) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Notification not found");
    }

    if (notification.user_id !== userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    await notificationRepository.deleteNotification(notificationId);
};

module.exports = {
    sendNotification,
    getNotifications,
    markNotificationAsRead,
    removeNotification,
};
