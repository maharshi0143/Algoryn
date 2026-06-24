const { pool: db } = require("../config/db");

const createActivityLog = async (userId, action, description) => {
    const result = await db.query(
        `INSERT INTO activity_logs(user_id, action, metadata) VALUES($1, $2, $3) RETURNING *`,
        [userId, action, JSON.stringify({ description })]
    );

    return result.rows[0];
};

const findActivitiesByUserId = async (userId, limit = 20) => {
    const result = await db.query(
        `SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [userId, limit]
    );

    return result.rows;
};

module.exports = {
    createActivityLog,
    findActivitiesByUserId,
};