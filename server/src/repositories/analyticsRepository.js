const db = require("../config/db");

// Get total solved problems grouped by platform
const getPlatformComparison = async (userId) => {
    const result = await db.query(
        `SELECT cp.platform, ps.total_solved
         FROM coding_profiles cp
         JOIN problem_stats ps ON cp.id = ps.profile_id
         WHERE cp.user_id = $1
         ORDER BY ps.total_solved DESC`,
        [userId]
    );

    return result.rows;
};

// Get aggregated counts by difficulty level
const getDifficultyDistribution = async (userId) => {
    const result = await db.query(
        `SELECT
            COALESCE(SUM(ps.easy_count), 0) AS easy,
            COALESCE(SUM(ps.medium_count), 0) AS medium,
            COALESCE(SUM(ps.hard_count), 0) AS hard
         FROM coding_profiles cp
         JOIN problem_stats ps ON cp.id = ps.profile_id
         WHERE cp.user_id = $1`,
        [userId]
    );

    return result.rows[0];
};

// Get daily GitHub contribution history
const getContributionTrend = async (userId) => {
    const result = await db.query(
        `SELECT date, github_contributions
         FROM daily_stats
         WHERE user_id = $1
         ORDER BY date`,
        [userId]
    );

    return result.rows;
};

// Get monthly problem-solving progress for the current year
const getYearlyProgress = async (userId) => {
    const result = await db.query(
        `SELECT EXTRACT(MONTH FROM date) AS month, SUM(problems_solved) AS problems_solved
         FROM daily_stats
         WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
         GROUP BY EXTRACT(MONTH FROM date)
         ORDER BY EXTRACT(MONTH FROM date)`,
        [userId]
    );

    return result.rows;
};

module.exports = {
    getPlatformComparison,
    getDifficultyDistribution,
    getContributionTrend,
    getYearlyProgress,
};
