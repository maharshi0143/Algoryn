const { pool: db } = require("../config/db");

const findByUserId = async (userId) => {
    const result = await db.query(
        "SELECT * FROM email_preferences WHERE user_id = $1",
        [userId]
    );
    return result.rows[0];
};

const upsert = async (userId, preferences) => {
    const { weekly_report, contest_reminder, streak_alert, achievement_alert } = preferences;

    const result = await db.query(
        `INSERT INTO email_preferences (user_id, weekly_report, contest_reminder, streak_alert, achievement_alert)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id)
         DO UPDATE SET weekly_report = $2, contest_reminder = $3, streak_alert = $4, achievement_alert = $5, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, weekly_report, contest_reminder, streak_alert, achievement_alert]
    );

    return result.rows[0];
};

module.exports = {
    findByUserId,
    upsert,
};
