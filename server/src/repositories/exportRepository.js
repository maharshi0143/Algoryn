const db = require("../config/db");

const findUserInfo = async (userId) => {
    const result = await db.query(
        `SELECT id, name, email, avatar, bio FROM users WHERE id = $1`,
        [userId]
    );

    return result.rows[0];
};

const findProfiles = async (userId) => {
    const result = await db.query(
        `SELECT platform, username FROM coding_profiles WHERE user_id = $1 ORDER BY platform`,
        [userId]
    );

    return result.rows;
};

const findStats = async (userId) => {
    const result = await db.query(
        `SELECT
            COALESCE(SUM(ps.total_solved), 0) AS total_solved,
            COALESCE(MAX(ps.streak), 0) AS streak,
            COALESCE(SUM(gs.contributions), 0) AS contributions
         FROM coding_profiles cp
         LEFT JOIN problem_stats ps ON ps.profile_id = cp.id
         LEFT JOIN github_stats gs ON gs.profile_id = cp.id
         WHERE cp.user_id = $1`,
        [userId]
    );

    return result.rows[0];
};

const findAchievements = async (userId) => {
    const result = await db.query(
        `SELECT title, description, icon, created_at AS unlocked_at
         FROM achievements WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );

    return result.rows;
};

const findActivities = async (userId, limit = 20) => {
    const result = await db.query(
        `SELECT action AS type, metadata->>'description' AS description, created_at
         FROM activity_logs WHERE user_id = $1
         ORDER BY created_at DESC LIMIT $2`,
        [userId, limit]
    );

    return result.rows;
};

module.exports = {
    findUserInfo,
    findProfiles,
    findStats,
    findAchievements,
    findActivities,
};