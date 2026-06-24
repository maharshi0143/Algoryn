const db = require("../config/db");

// Store a refresh token for a user with an expiration date
const saveRefreshToken = async (userId, token, expiresAt) => {
    await db.query(
        `INSERT INTO refresh_tokens(user_id, token, expires_at) VALUES($1, $2, $3)`,
        [userId, token, expiresAt]
    );
};

// Find a refresh token by its value
const findRefreshToken = async (token) => {
    const result = await db.query(`SELECT * FROM refresh_tokens WHERE token = $1`, [token]);
    return result.rows[0];
};

// Delete a refresh token (used on logout / rotation)
const deleteRefreshToken = async (token) => {
    await db.query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
};

module.exports = {
    saveRefreshToken,
    findRefreshToken,
    deleteRefreshToken,
};
