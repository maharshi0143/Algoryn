const { pool: db } = require("../config/db");

// Get daily stats for the last 7 days
const findWeeklyStats = async (userId) => {
    const result = await db.query(
        `SELECT * FROM daily_stats
         WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days'
         ORDER BY date`,
        [userId]
    );

    return result.rows;
};

// Get daily stats for the last 30 days
const findMonthlyStats = async (userId) => {
    const result = await db.query(
        `SELECT * FROM daily_stats
         WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
         ORDER BY date`,
        [userId]
    );

    return result.rows;
};

// Get all daily stats for heatmap visualization
const findHeatmapStats = async (userId) => {
    const result = await db.query(
        `SELECT date, problems_solved FROM daily_stats
         WHERE user_id = $1
         ORDER BY date`,
        [userId]
    );

    return result.rows;
};

// Upsert daily stats for a user on a given date
const upsertDailyStats = async (userId, date, problemsSolved, easyCount, mediumCount, hardCount, githubContributions, cumulativeTotal) => {
    const result = await db.query(
        `INSERT INTO daily_stats(user_id, date, problems_solved, easy_count, medium_count, hard_count, github_contributions, cumulative_total)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (user_id, date)
         DO UPDATE SET problems_solved = EXCLUDED.problems_solved,
                       easy_count = EXCLUDED.easy_count,
                       medium_count = EXCLUDED.medium_count,
                       hard_count = EXCLUDED.hard_count,
                       github_contributions = EXCLUDED.github_contributions,
                       cumulative_total = EXCLUDED.cumulative_total
         RETURNING *`,
        [userId, date, problemsSolved, easyCount, mediumCount, hardCount, githubContributions, cumulativeTotal]
    );
    return result.rows[0];
};

const findLatestBeforeDate = async (userId, beforeDate) => {
    const result = await db.query(
        `SELECT * FROM daily_stats
         WHERE user_id = $1 AND date < $2
         ORDER BY date DESC
         LIMIT 1`,
        [userId, beforeDate]
    );
    return result.rows[0];
};

const findByUserAndDate = async (userId, date) => {
    const result = await db.query(
        `SELECT * FROM daily_stats WHERE user_id = $1 AND date = $2`,
        [userId, date]
    );
    return result.rows[0];
};

// Upsert calendar stats without affecting cumulative_total or claim status
const upsertCalendarStats = async (userId, date, submissions) => {
    const result = await db.query(
        `INSERT INTO daily_stats(user_id, date, problems_solved)
         VALUES($1, $2, $3)
         ON CONFLICT (user_id, date)
         DO UPDATE SET problems_solved = CASE WHEN daily_stats.cumulative_total IS NULL THEN EXCLUDED.problems_solved ELSE daily_stats.problems_solved END`,
        [userId, date, submissions]
    );
    return result.rows[0];
};

const setClaimed = async (userId, date) => {
    const result = await db.query(
        `UPDATE daily_stats SET claimed = true WHERE user_id = $1 AND date = $2 RETURNING *`,
        [userId, date]
    );
    return result.rows[0];
};

const sumClaimedXP = async (userId) => {
    const result = await db.query(
        `SELECT COALESCE(SUM(problems_solved * 5), 0) AS total FROM daily_stats WHERE user_id = $1 AND claimed = true`,
        [userId]
    );
    return Number(result.rows[0]?.total ?? 0);
};

module.exports = {
    findWeeklyStats,
    findMonthlyStats,
    findHeatmapStats,
    upsertDailyStats,
    upsertCalendarStats,
    findLatestBeforeDate,
    findByUserAndDate,
    setClaimed,
    sumClaimedXP,
};

