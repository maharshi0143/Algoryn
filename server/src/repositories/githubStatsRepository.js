const { pool: db } = require("../config/db");

// Find GitHub stats by profile ID
const findGithubStats = async (profileId) => {
    const result = await db.query("SELECT * FROM github_stats WHERE profile_id = $1", [profileId]);
    return result.rows[0];
};

// Create GitHub stats for a profile
const createGithubStats = async (profileId, repositories, followers, following, stars, contributions, languages, commits = 0) => {
    const result = await db.query(
        `INSERT INTO github_stats(profile_id, repositories, followers, following, stars, contributions, languages, commits)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [profileId, repositories, followers, following, stars, contributions, languages, commits]
    );
    return result.rows[0];
};

// Update existing GitHub stats for a profile
const updateGithubStats = async (profileId, repositories, followers, following, stars, contributions, languages, commits = 0) => {
    const result = await db.query(
        `UPDATE github_stats
         SET repositories = $1, followers = $2, following = $3, stars = $4,
             contributions = $5, languages = $6, commits = $7, last_synced = CURRENT_TIMESTAMP
         WHERE profile_id = $8 RETURNING *`,
        [repositories, followers, following, stars, contributions, languages, commits, profileId]
    );
    return result.rows[0];
};

// Get aggregated GitHub stats for a user across all their GitHub profiles
const findGithubStatsByUserId = async (userId) => {
    const result = await db.query(
        `SELECT
            COALESCE(SUM(gs.repositories),0) AS repositories,
            COALESCE(SUM(gs.followers),0) AS followers,
            COALESCE(SUM(gs.contributions),0) AS contributions
        FROM coding_profiles cp
        JOIN github_stats gs
        ON cp.id = gs.profile_id
        WHERE cp.user_id = $1`,
        [userId]
    );
    return result.rows[0];
};

module.exports = {
    findGithubStats,
    createGithubStats,
    updateGithubStats,
    findGithubStatsByUserId,
};
