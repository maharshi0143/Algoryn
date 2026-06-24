const db = require("../config/db");

const getGlobalLeaderboard = async (page = 1, limit = 50) => {
    const offset = (page - 1) * limit;

    const countResult = await db.query(`
        SELECT COUNT(*)::int AS total FROM users u
        WHERE EXISTS (SELECT 1 FROM coding_profiles cp WHERE cp.user_id = u.id)
    `);

    const result = await db.query(`
        SELECT
            u.id,
            u.name,
            u.avatar,
            COALESCE(SUM(ps.total_solved), 0) AS total_solved,
            COALESCE(MAX(ps.streak), 0) AS streak,
            COALESCE(SUM(gs.contributions), 0) AS contributions
        FROM users u
        LEFT JOIN coding_profiles cp ON cp.user_id = u.id
        LEFT JOIN problem_stats ps ON ps.profile_id = cp.id
        LEFT JOIN github_stats gs ON gs.profile_id = cp.id
        GROUP BY u.id, u.name, u.avatar
        ORDER BY total_solved DESC
        LIMIT $1 OFFSET $2
    `, [limit, offset]);

    return {
        data: result.rows,
        page,
        limit,
        total: countResult.rows[0].total,
        totalPages: Math.ceil(countResult.rows[0].total / limit),
    };
};

const getFriendsLeaderboard = async (userId) => {
    const result = await db.query(
        `
        SELECT
            u.id,
            u.name,
            u.avatar,
            COALESCE(SUM(ps.total_solved), 0) AS total_solved,
            COALESCE(MAX(ps.streak), 0) AS streak,
            COALESCE(SUM(gs.contributions), 0) AS contributions
        FROM friends f
        JOIN users u ON (CASE WHEN f.user_id = $1 THEN f.friend_id ELSE f.user_id END) = u.id
        LEFT JOIN coding_profiles cp ON cp.user_id = u.id
        LEFT JOIN problem_stats ps ON ps.profile_id = cp.id
        LEFT JOIN github_stats gs ON gs.profile_id = cp.id
        WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted'
        GROUP BY u.id, u.name, u.avatar
        ORDER BY total_solved DESC
        `,
        [userId]
    );

    return result.rows;
};

const getTopStreaks = async () => {
    const result = await db.query(`
        SELECT
            u.id,
            u.name,
            u.avatar,
            MAX(ps.streak) AS streak
        FROM users u
        JOIN coding_profiles cp ON cp.user_id = u.id
        JOIN problem_stats ps ON ps.profile_id = cp.id
        GROUP BY u.id, u.name, u.avatar
        ORDER BY streak DESC
        LIMIT 10
    `);

    return result.rows;
};

const getTopContributors = async () => {
    const result = await db.query(`
        SELECT
            u.id,
            u.name,
            u.avatar,
            MAX(gs.contributions) AS contributions
        FROM users u
        JOIN coding_profiles cp ON cp.user_id = u.id
        JOIN github_stats gs ON gs.profile_id = cp.id
        GROUP BY u.id, u.name, u.avatar
        ORDER BY contributions DESC
        LIMIT 10
    `);

    return result.rows;
};

const getPlatformLeaderboard = async (platform) => {
    const result = await db.query(
        `
        SELECT
            u.id,
            u.name,
            u.avatar,
            cp.platform,
            ps.total_solved,
            ps.rating,
            ps.streak
        FROM users u
        JOIN coding_profiles cp ON cp.user_id = u.id
        JOIN problem_stats ps ON ps.profile_id = cp.id
        WHERE cp.platform = $1
        ORDER BY ps.total_solved DESC
        `,
        [platform]
    );

    return result.rows;
};

module.exports = {
    getGlobalLeaderboard,
    getFriendsLeaderboard,
    getTopStreaks,
    getTopContributors,
    getPlatformLeaderboard,
};