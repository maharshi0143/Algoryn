const db = require("../config/knex");

const getGlobalLeaderboard = async (page = 1, limit = 50) => {
    const offset = (page - 1) * limit;

    const [countResult] = await db("users as u")
        .whereExists(
            db("coding_profiles as cp").whereRaw("cp.user_id = u.id")
        )
        .count({ total: "*" });

    const data = await db("users as u")
        .leftJoin("coding_profiles as cp", "cp.user_id", "u.id")
        .leftJoin("problem_stats as ps", "ps.profile_id", "cp.id")
        .leftJoin("github_stats as gs", "gs.profile_id", "cp.id")
        .select(
            "u.id",
            "u.name",
            "u.avatar",
            db.raw("COALESCE(SUM(ps.total_solved), 0) AS total_solved"),
            db.raw("COALESCE(MAX(ps.streak), 0) AS streak"),
            db.raw("COALESCE(SUM(gs.contributions), 0) AS contributions"),
        )
        .groupBy("u.id", "u.name", "u.avatar")
        .orderBy("total_solved", "desc")
        .limit(limit)
        .offset(offset);

    return {
        data,
        page,
        limit,
        total: parseInt(countResult?.total || 0, 10),
        totalPages: Math.ceil(parseInt(countResult?.total || 0, 10) / limit),
    };
};

const getFriendsLeaderboard = async (userId) => {
    return db("friends as f")
        .join("users as u", db.raw("(CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END) = u.id", [userId]))
        .leftJoin("coding_profiles as cp", "cp.user_id", "u.id")
        .leftJoin("problem_stats as ps", "ps.profile_id", "cp.id")
        .leftJoin("github_stats as gs", "gs.profile_id", "cp.id")
        .select(
            "u.id",
            "u.name",
            "u.avatar",
            db.raw("COALESCE(SUM(ps.total_solved), 0) AS total_solved"),
            db.raw("COALESCE(MAX(ps.streak), 0) AS streak"),
            db.raw("COALESCE(SUM(gs.contributions), 0) AS contributions"),
        )
        .where(function () {
            this.where("f.user_id", userId).orWhere("f.friend_id", userId);
        })
        .where("f.status", "accepted")
        .groupBy("u.id", "u.name", "u.avatar")
        .orderBy("total_solved", "desc");
};

const getTopStreaks = async () => {
    return db("users as u")
        .join("coding_profiles as cp", "cp.user_id", "u.id")
        .join("problem_stats as ps", "ps.profile_id", "cp.id")
        .select(
            "u.id",
            "u.name",
            "u.avatar",
            db.raw("MAX(ps.streak) AS streak"),
        )
        .groupBy("u.id", "u.name", "u.avatar")
        .orderBy("streak", "desc")
        .limit(10);
};

const getTopContributors = async () => {
    return db("users as u")
        .join("coding_profiles as cp", "cp.user_id", "u.id")
        .join("github_stats as gs", "gs.profile_id", "cp.id")
        .select(
            "u.id",
            "u.name",
            "u.avatar",
            db.raw("MAX(gs.contributions) AS contributions"),
        )
        .groupBy("u.id", "u.name", "u.avatar")
        .orderBy("contributions", "desc")
        .limit(10);
};

const getPlatformLeaderboard = async (platform) => {
    return db("users as u")
        .join("coding_profiles as cp", "cp.user_id", "u.id")
        .join("problem_stats as ps", "ps.profile_id", "cp.id")
        .select(
            "u.id",
            "u.name",
            "u.avatar",
            "cp.platform",
            "ps.total_solved",
            "ps.rating",
            "ps.streak",
        )
        .where("cp.platform", platform)
        .orderBy("ps.total_solved", "desc");
};

module.exports = {
    getGlobalLeaderboard,
    getFriendsLeaderboard,
    getTopStreaks,
    getTopContributors,
    getPlatformLeaderboard,
};