const { pool: db } = require("../config/db");

// Create a new notification for a user
const createNotification = async (userId, type, message) => {
    const result = await db.query(
        `INSERT INTO notifications(user_id, type, message) VALUES($1, $2, $3) RETURNING *`,
        [userId, type, message]
    );
    return result.rows[0];
};

// Get all notifications for a user, most recent first (with pagination)
const findNotificationsByUserId = async (userId, limit = 20, offset = 0) => {
    const result = await db.query(
        `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );
    return result.rows;
};

// Count notifications for a user
const countByUserId = async (userId) => {
    const result = await db.query(
        `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1`,
        [userId]
    );
    return result.rows[0].count;
};

// Find a single notification by its ID
const findNotificationById = async (notificationId) => {
    const result = await db.query(
        `SELECT * FROM notifications WHERE id = $1`,
        [notificationId]
    );
    return result.rows[0];
};

// Mark a notification as read
const markAsRead = async (notificationId) => {
    const result = await db.query(
        `UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *`,
        [notificationId]
    );
    return result.rows[0];
};

// Find notifications by user_id and type created since a given timestamp
const findByUserIdAndTypeSince = async (userId, type, since) => {
    const result = await db.query(
        `SELECT * FROM notifications WHERE user_id = $1 AND type = $2 AND created_at >= $3 ORDER BY created_at DESC`,
        [userId, type, since]
    );
    return result.rows;
};

// Delete a notification by its ID
const deleteNotification = async (notificationId) => {
    await db.query(`DELETE FROM notifications WHERE id = $1`, [notificationId]);
};

module.exports = {
    createNotification,
    findNotificationsByUserId,
    countByUserId,
    findNotificationById,
    findByUserIdAndTypeSince,
    markAsRead,
    deleteNotification,
};