const db = require("../config/db");

// Get aggregated problem stats for a user across all platforms
const findProblemStatsByUserId = async (userId) => {
    const result = await db.query(
        `SELECT
            COALESCE(SUM(ps.total_solved), 0) AS total_solved,
            COALESCE(SUM(ps.easy_count), 0) AS easy_count,
            COALESCE(SUM(ps.medium_count), 0) AS medium_count,
            COALESCE(SUM(ps.hard_count), 0) AS hard_count,
            COALESCE(MAX(ps.streak), 0) AS streak
         FROM coding_profiles cp
         JOIN problem_stats ps ON cp.id = ps.profile_id
         WHERE cp.user_id = $1`,
        [userId]
    );

    return result.rows[0];
};

// Find problem stats by profile ID
const findProblemStatsByProfileId = async (profileId) => {
    const result = await db.query(`SELECT * FROM problem_stats WHERE profile_id = $1`, [profileId]);
    return result.rows[0];
};

// Create problem stats for a profile
const createProblemStats = async (profileId, totalSolved, easyCount, mediumCount, hardCount, rating, ranking, streak) => {
    const result = await db.query(
        `INSERT INTO problem_stats(profile_id, total_solved, easy_count, medium_count, hard_count, rating, ranking, streak)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [profileId, totalSolved, easyCount, mediumCount, hardCount, rating, ranking, streak]
    );
    return result.rows[0];
};

// Update problem stats for a profile
const updateProblemStats = async (profileId, totalSolved, easyCount, mediumCount, hardCount, rating, ranking, streak) => {
    const result = await db.query(
        `UPDATE problem_stats
         SET total_solved = $1, easy_count = $2, medium_count = $3, hard_count = $4,
             rating = $5, ranking = $6, streak = $7, last_synced = CURRENT_TIMESTAMP
         WHERE profile_id = $8 RETURNING *`,
        [totalSolved, easyCount, mediumCount, hardCount, rating, ranking, streak, profileId]
    );
    return result.rows[0];
};

module.exports = {
    findProblemStatsByUserId,
    findProblemStatsByProfileId,
    createProblemStats,
    updateProblemStats,
};
