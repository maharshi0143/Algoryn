const { pool: db } = require("../config/db");

const findUserByUsername = async (username) => {
    const result = await db.query(
        `SELECT id, name, avatar, bio FROM users WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [username]
    );

    return result.rows[0];
};

const findCodingProfiles = async (userId) => {
    const result = await db.query(
        `SELECT platform, username FROM coding_profiles WHERE user_id = $1 ORDER BY platform`,
        [userId]
    );

    return result.rows;
};

const findAchievements = async (userId) => {
    const result = await db.query(
        `SELECT title, description, icon, created_at AS unlocked_at
         FROM achievements WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 10`,
        [userId]
    );

    return result.rows;
};

const findActivities = async (userId) => {
    const result = await db.query(
        `SELECT action AS type, metadata->>'description' AS description, created_at
         FROM activity_logs WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 20`,
        [userId]
    );

    return result.rows;
};

module.exports = {
    findUserByUsername,
    findCodingProfiles,
    findAchievements,
    findActivities,
};