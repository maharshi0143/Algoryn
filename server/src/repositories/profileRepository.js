const db = require("../config/db");

// Create a new coding profile
const createProfile = async (userId, platform, username, profileUrl) => {
    const result = await db.query(
        `INSERT INTO coding_profiles(user_id, platform, username, profile_url) VALUES($1, $2, $3, $4) RETURNING *`,
        [userId, platform, username, profileUrl]
    );
    return result.rows[0];
};

// Find a profile by user ID and platform
const findByUserAndPlatform = async (userId, platform) => {
    const result = await db.query(
        "SELECT * FROM coding_profiles WHERE user_id = $1 AND platform = $2",
        [userId, platform]
    );
    return result.rows[0];
};

// Get all profiles for a user (with pagination)
const findByUserId = async (userId, limit = 20, offset = 0) => {
    const result = await db.query(
        "SELECT * FROM coding_profiles WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
        [userId, limit, offset]
    );
    return result.rows;
};

// Count profiles for a user
const countByUserId = async (userId) => {
    const result = await db.query(
        "SELECT COUNT(*)::int AS count FROM coding_profiles WHERE user_id = $1",
        [userId]
    );
    return result.rows[0].count;
};

// Find a single profile by its ID
const findById = async (profileId) => {
    const result = await db.query("SELECT * FROM coding_profiles WHERE id = $1", [profileId]);
    return result.rows[0];
};

// Update a profile's username and optional profile URL
const updateProfile = async (profileId, username, profileUrl) => {
    const result = await db.query(
        `UPDATE coding_profiles SET username = $1, profile_url = COALESCE($2, profile_url) WHERE id = $3 RETURNING *`,
        [username, profileUrl, profileId]
    );
    return result.rows[0];
};

// Delete a profile by its ID
const deleteProfile = async (profileId) => {
    const result = await db.query(
        "DELETE FROM coding_profiles WHERE id = $1 RETURNING *",
        [profileId]
    );
    return result.rows[0];
};

module.exports = {
    createProfile,
    findByUserAndPlatform,
    findByUserId,
    countByUserId,
    findById,
    updateProfile,
    deleteProfile,
};
