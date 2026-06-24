const { pool: db } = require("../config/db");

// Create a new achievement for a user
const createAchievement = async (userId, type, title, description, icon) => {
    const result = await db.query(
        `INSERT INTO achievements(user_id, type, title, description, icon) VALUES($1, $2, $3, $4, $5) RETURNING *`,
        [userId, type, title, description, icon]
    );
    return result.rows[0];
};

// Get all achievements for a user, most recent first
const findAchievementsByUserId = async (userId) => {
    const result = await db.query(
        `SELECT * FROM achievements WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows;
};

// Find an achievement by title for a user (prevents duplicates)
const findAchievementByTitle = async (userId, title) => {
    const result = await db.query(
        `SELECT * FROM achievements WHERE user_id = $1 AND title = $2`,
        [userId, title]
    );
    return result.rows[0];
};

module.exports = {
    createAchievement,
    findAchievementsByUserId,
    findAchievementByTitle,
};
