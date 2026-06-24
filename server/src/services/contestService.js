const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");

const profileRepository = require("../repositories/profileRepository");
const contestRepository = require("../repositories/contestRepository");
const { fetchCodeforcesRatingHistory, fetchCodeforcesUpcomingContests } = require("../integrations/codeforces/codeforcesService");

// Get contest history for a user (currently only Codeforces, with pagination)
const getContestHistory = async (userId, page = 1, limit = 20) => {
    const profile = await profileRepository.findByUserAndPlatform(userId, "codeforces");

    if (!profile) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Codeforces profile not found");
    }

    const offset = (page - 1) * limit;
    const rows = await contestRepository.findContestHistory(profile.id, limit, offset);
    const total = await contestRepository.countByProfileId(profile.id);

    return {
        data: rows,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

// Get rating graph data (mapped contest name + new rating)
const getRatingGraph = async (userId) => {
    const { data } = await getContestHistory(userId);

    return data.map((contest) => ({
        contestName: contest.contest_name,
        rating: contest.new_rating,
    }));
};

// Get upcoming contests from Codeforces
const getUpcomingContests = async () => {
    const codeforces = await fetchCodeforcesUpcomingContests();
    return codeforces;
};

// Fetch Codeforces contest history from API and store new entries
const syncContestHistory = async (userId) => {
    const profile = await profileRepository.findByUserAndPlatform(userId, "codeforces");

    if (!profile) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Codeforces profile not found");
    }

    const ratingHistory = await fetchCodeforcesRatingHistory(profile.username);

    if (!ratingHistory || ratingHistory.length === 0) return [];

    const existingNames = await contestRepository.findContestNamesByProfileId(profile.id);

    const synced = [];

    for (const entry of ratingHistory) {
        const name = entry.contestName || entry.contest_name;

        if (existingNames.has(name)) continue;

        const ratingChange = entry.ratingChange ?? (entry.newRating - (entry.oldRating ?? 0));

        const contest = await contestRepository.createContest(
            profile.id,
            name,
            entry.rank,
            ratingChange,
            entry.newRating,
            new Date(entry.ratingUpdateTimeSeconds * 1000),
        );

        synced.push(contest);
    }

    return synced;
};

module.exports = {
    getContestHistory,
    getRatingGraph,
    getUpcomingContests,
    syncContestHistory,
};