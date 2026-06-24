const db = require("../config/db");

const createWeeklyReport = async (userId, weekStart, weekEnd, summary, recommendations) => {
    const result = await db.query(
        `INSERT INTO weekly_reports(user_id, week_start, week_end, summary, recommendations)
         VALUES($1, $2, $3, $4, $5) RETURNING *`,
        [userId, weekStart, weekEnd, summary, recommendations]
    );

    return result.rows[0];
};

const findLatestWeeklyReport = async (userId) => {
    const result = await db.query(
        `SELECT * FROM weekly_reports WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
    );

    return result.rows[0];
};

const findReportsByUserId = async (userId) => {
    const result = await db.query(
        `SELECT * FROM weekly_reports WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );

    return result.rows;
};

module.exports = {
    createWeeklyReport,
    findLatestWeeklyReport,
    findReportsByUserId,
};