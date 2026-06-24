const db = require("../config/db");

const createReminder = async (userId, platform, minutesBefore) => {
    const result = await db.query(
        `INSERT INTO contest_reminders(user_id, platform, minutes_before)
         VALUES($1, $2, $3) RETURNING *`,
        [userId, platform, minutesBefore]
    );

    return result.rows[0];
};

const findRemindersByUserId = async (userId) => {
    const result = await db.query(
        `SELECT * FROM contest_reminders WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );

    return result.rows;
};

const findReminderById = async (reminderId) => {
    const result = await db.query(
        `SELECT * FROM contest_reminders WHERE id = $1`,
        [reminderId]
    );

    return result.rows[0];
};

const findActiveReminders = async () => {
    const result = await db.query(
        `SELECT * FROM contest_reminders WHERE is_active = TRUE`
    );

    return result.rows;
};

const deleteReminder = async (reminderId) => {
    await db.query(`DELETE FROM contest_reminders WHERE id = $1`, [reminderId]);
};

module.exports = {
    createReminder,
    findRemindersByUserId,
    findReminderById,
    findActiveReminders,
    deleteReminder,
};