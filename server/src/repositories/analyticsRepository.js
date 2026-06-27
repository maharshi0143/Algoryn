const db = require("../config/knex");

// Get total solved problems grouped by platform
const getPlatformComparison = async (userId) => {
    return db("coding_profiles as cp")
        .join("problem_stats as ps", "cp.id", "ps.profile_id")
        .select("cp.platform", "ps.total_solved", "ps.rating", "ps.ranking")
        .where("cp.user_id", userId)
        .orderBy("ps.total_solved", "desc");
};

// Get aggregated counts by difficulty level
const getDifficultyDistribution = async (userId) => {
    const result = await db("coding_profiles as cp")
        .join("problem_stats as ps", "cp.id", "ps.profile_id")
        .where("cp.user_id", userId)
        .select(
            db.raw("COALESCE(SUM(ps.easy_count), 0) AS easy"),
            db.raw("COALESCE(SUM(ps.medium_count), 0) AS medium"),
            db.raw("COALESCE(SUM(ps.hard_count), 0) AS hard"),
        )
        .first();

    return result || { easy: 0, medium: 0, hard: 0 };
};

// Get daily GitHub contribution history
const getContributionTrend = async (userId) => {
    return db("daily_stats")
        .select("date", "github_contributions")
        .where("user_id", userId)
        .orderBy("date");
};

// Get monthly problem-solving progress for the current year
const getYearlyProgress = async (userId) => {
    return db("daily_stats")
        .select(
            db.raw("EXTRACT(MONTH FROM date) AS month"),
            db.raw("SUM(problems_solved) AS problems_solved"),
        )
        .where("user_id", userId)
        .whereRaw("EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)")
        .groupByRaw("EXTRACT(MONTH FROM date)")
        .orderByRaw("EXTRACT(MONTH FROM date)");
};

// Get language distribution from GitHub stats
const getLanguageDistribution = async (userId) => {
    const result = await db("coding_profiles as cp")
        .join("github_stats as gs", "cp.id", "gs.profile_id")
        .select("gs.languages")
        .where("cp.user_id", userId)
        .where("cp.platform", "github")
        .first();

    if (!result || !result.languages) return [];

    const langs = typeof result.languages === "string" ? JSON.parse(result.languages) : result.languages;
    const total = Object.values(langs).reduce((sum, v) => sum + Number(v), 0);
    if (total === 0) return [];

    return Object.entries(langs)
        .map(([language, value]) => ({
            language,
            percentage: Math.round((Number(value) / total) * 100),
            value: Number(value),
        }))
        .sort((a, b) => b.percentage - a.percentage);
};

module.exports = {
    getPlatformComparison,
    getDifficultyDistribution,
    getContributionTrend,
    getYearlyProgress,
    getLanguageDistribution,
};
