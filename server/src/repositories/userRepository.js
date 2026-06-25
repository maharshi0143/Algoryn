const { pool: db } = require("../config/db");

// Find a user by their email
const findUserByEmail = async (email) => {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
};

// Find a user by verification token hash
const findUserByVerificationTokenHash = async (tokenHash) => {
    const result = await db.query(
        `SELECT * FROM users
         WHERE verification_token_hash = $1
         AND verification_token_expires_at > NOW()`,
        [tokenHash]
    );

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

// Create a new user
const createUser = async (
    name,
    email,
    password,
    verificationTokenHash,
    verificationTokenExpiresAt
) => {
    const result = await db.query(
        `
        INSERT INTO users (
            name,
            email,
            password,
            is_verified,
            verification_token_hash,
            verification_token_expires_at
        )
        VALUES ($1, $2, $3, FALSE, $4, $5)
        RETURNING *
        `,
        [
            name,
            email,
            password,
            verificationTokenHash,
            verificationTokenExpiresAt,
        ]
    );

    return result.rows[0];
};

// Mark email as verified
const verifyUserEmail = async (userId) => {
    const result = await db.query(
        `
        UPDATE users
        SET
            is_verified = TRUE,
            verification_token_hash = NULL,
            verification_token_expires_at = NULL
        WHERE id = $1
        RETURNING *
        `,
        [userId]
    );

    return result.rows[0];
};

// Update verification token
const updateVerificationToken = async (
    userId,
    verificationTokenHash,
    verificationTokenExpiresAt
) => {
    const result = await db.query(
        `
        UPDATE users
        SET
            verification_token_hash = $1,
            verification_token_expires_at = $2
        WHERE id = $3
        RETURNING *
        `,
        [
            verificationTokenHash,
            verificationTokenExpiresAt,
            userId,
        ]
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
    findUserByVerificationTokenHash,
    findUserById,
    findUserByIdForAuth,
    createUser,
    verifyUserEmail,
    updateVerificationToken,
    findAllUsers,
    updatePassword,
    deleteUser,
};