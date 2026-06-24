const { pool: db } = require("../config/db");

const sendFriendRequest = async (userId, friendId) => {
    const result = await db.query(
        `INSERT INTO friends(user_id, friend_id, status) VALUES($1, $2, 'pending') RETURNING *`,
        [userId, friendId],
    );
    return result.rows[0];
};

const findFriendById = async (friendshipId) => {
    const result = await db.query(`SELECT * FROM friends WHERE id = $1`, [friendshipId]);
    return result.rows[0];
};

const findFriendship = async (userId, friendId) => {
    const result = await db.query(
        `SELECT * FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
        [userId, friendId],
    );
    return result.rows[0];
};

const findFriendsByUserId = async (userId) => {
    const result = await db.query(
        `SELECT f.id, u.id AS friend_id, u.name, u.email, u.avatar
         FROM friends f
         JOIN users u ON (CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END) = u.id
         WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'`,
        [userId],
    );
    return result.rows;
};

const findPendingRequests = async (userId) => {
    const result = await db.query(
        `SELECT f.id, u.id AS user_id, u.name, u.email, u.avatar
         FROM friends f
         JOIN users u ON f.user_id = u.id
         WHERE f.friend_id = $1 AND f.status = 'pending'`,
        [userId],
    );
    return result.rows;
};

const acceptFriendRequest = async (friendshipId) => {
    const result = await db.query(
        `UPDATE friends SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [friendshipId],
    );
    return result.rows[0];
};

const rejectFriendRequest = async (friendshipId) => {
    const result = await db.query(
        `UPDATE friends SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [friendshipId],
    );
    return result.rows[0];
};

const blockFriend = async (friendshipId) => {
    const result = await db.query(
        `UPDATE friends SET status = 'blocked', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [friendshipId],
    );
    return result.rows[0];
};

const deleteFriend = async (friendshipId) => {
    await db.query(`DELETE FROM friends WHERE id = $1`, [friendshipId]);
};

module.exports = {
    sendFriendRequest,
    findFriendById,
    findFriendship,
    findFriendsByUserId,
    findPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    blockFriend,
    deleteFriend,
};
