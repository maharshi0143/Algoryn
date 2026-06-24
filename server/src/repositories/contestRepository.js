const { pool: db } = require("../config/db");

// Get contest history for a profile, ordered by date descending (with pagination)
const findContestHistory = async (profileId, limit = 20, offset = 0) => {
    const result = await db.query(
        `SELECT * FROM contest_history WHERE profile_id = $1 ORDER BY contest_date DESC LIMIT $2 OFFSET $3`,
        [profileId, limit, offset]
    );
    return result.rows;
};

// Count contest entries for a profile
const countByProfileId = async (profileId) => {
    const result = await db.query(
        `SELECT COUNT(*)::int AS count FROM contest_history WHERE profile_id = $1`,
        [profileId]
    );
    return result.rows[0].count;
};

// Create a new contest entry
const createContest = async (profileId, contestName, rank, ratingChange, newRating, contestDate) => {
    const result = await db.query(
        `INSERT INTO contest_history(profile_id, contest_name, rank, rating_change, new_rating, contest_date) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
        [profileId, contestName, rank, ratingChange, newRating, contestDate]
    );
    return result.rows[0];
};

// Find a contest by profile ID and contest name (prevents duplicates)
const findContestByName = async (profileId, contestName) => {
    const result = await db.query(
        `SELECT * FROM contest_history WHERE profile_id = $1 AND contest_name = $2`,
        [profileId, contestName]
    );
    return result.rows[0];
};

const findContestNamesByProfileId = async (profileId) => {
    const result = await db.query(
        `SELECT contest_name FROM contest_history WHERE profile_id = $1`,
        [profileId]
    );
    return new Set(result.rows.map(r => r.contest_name));
};

module.exports = {
    findContestHistory,
    countByProfileId,
    createContest,
    findContestByName,
    findContestNamesByProfileId,
};