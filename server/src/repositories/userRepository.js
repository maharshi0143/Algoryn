const { pool: db } = require("../config/db");

// Find a user by their email
const findUserByEmail = async (email) => {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
};

// Find a user by their ID (excludes sensitive fields)
const findUserById = async (id) => {
    const result = await db.query(
        "SELECT id, name, email, avatar, bio, is_verified, is_active FROM users WHERE id = $1",
        [id]
    );
    return result.rows[0];
};

// Create a new user (auto-verified, no email verification needed)
const createUser = async (name, email, password) => {
    const result = await db.query(
        `
        INSERT INTO users (name, email, password, is_verified)
        VALUES ($1, $2, $3, TRUE)
        RETURNING *
        `,
        [name, email, password]
    );

    return result.rows[0];
};

// Get all active users
const findAllUsers = async () => {
    const result = await db.query(
        `SELECT id, email FROM users WHERE is_active = TRUE`
    );

    return result.rows;
};

const updatePassword = async (id, hashedPassword) => {
    const result = await db.query(
        "UPDATE users SET password = $1 WHERE id = $2 RETURNING id",
        [hashedPassword, id]
    );

    return result.rows[0];
};

const deleteUser = async (id) => {
    await db.query("DELETE FROM users WHERE id = $1", [id]);
};

const findUserByIdForAuth = async (id) => {
    const result = await db.query(
        "SELECT * FROM users WHERE id = $1",
        [id]
    );

    return result.rows[0];
};

module.exports = {
    findUserByEmail,
    findUserById,
    findUserByIdForAuth,
    createUser,
    findAllUsers,
    updatePassword,
    deleteUser,
};