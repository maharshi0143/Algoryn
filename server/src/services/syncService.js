const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");
const logger = require("../utils/logger");

const profileRepository = require("../repositories/profileRepository");
const githubStatsRepository = require("../repositories/githubStatsRepository");
const problemStatsRepository = require("../repositories/problemStatsRepository");
const dailyStatsRepository = require("../repositories/dailyStatsRepository");
const notificationService = require("./notificationService");
const contestService = require("./contestService");
const { fetchGithubProfile, fetchGithubRepositories, fetchGithubContributions } = require("../integrations/github/githubService");
const { fetchLeetCodeProfile, fetchLeetCodeSolved, fetchLeetCodeCalendar } = require("../integrations/leetcode/leetcodeService");
const { fetchCodeforcesProfile, fetchCodeforcesRatingHistory } = require("../integrations/codeforces/codeforcesService");
const { fetchCodeChefProfile } = require("../integrations/codechef/codechefService");
const { fetchGFGProfile } = require("../integrations/gfg/gfgService");
const { fetchHackerRankProfile, fetchHackerRankBadges } = require("../integrations/hackerrank/hackerrankService");



// Sync GitHub profile data and stats for a user
const syncGithub = async (userId) => {
    const profile = await profileRepository.findByUserAndPlatform(userId, "github");

    if (!profile) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "GitHub profile not found");
    }

    const [githubProfile, repositories, contributions] = await Promise.all([
        fetchGithubProfile(profile.username),
        fetchGithubRepositories(profile.username),
        fetchGithubContributions(profile.username),
    ]);

    let totalStars = 0;
    const languages = {};

    repositories.forEach((repo) => {
        totalStars += repo.stargazers_count || 0;

        if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
    });

    const existingStats = await githubStatsRepository.findGithubStats(profile.id);

    const sendNotif = () => notificationService.sendNotification(userId, "sync", "GitHub synced successfully")
        .catch(err => logger.error("Sync notification failed", err));

    const today = new Date();

    if (!existingStats) {
        const stats = await githubStatsRepository.createGithubStats(
            profile.id, githubProfile.public_repos, githubProfile.followers,
            githubProfile.following, totalStars, contributions, languages
        );
        await dailyStatsRepository.upsertDailyStats(userId, today, 0, 0, 0, 0, contributions);
        await sendNotif();
        return stats;
    }

    const stats = await githubStatsRepository.updateGithubStats(
        profile.id, githubProfile.public_repos, githubProfile.followers,
        githubProfile.following, totalStars, contributions, languages
    );

    await dailyStatsRepository.upsertDailyStats(userId, today, 0, 0, 0, 0, contributions);
    await sendNotif();

    return stats;
};

// Sync LeetCode profile and problem stats for a user
const syncLeetCode = async (userId) => {
    const profile = await profileRepository.findByUserAndPlatform(userId, "leetcode");

    if (!profile) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "LeetCode profile not found");
    }

    const [leetcodeProfile, solvedData, calendarData] = await Promise.all([
        fetchLeetCodeProfile(profile.username),
        fetchLeetCodeSolved(profile.username),
        fetchLeetCodeCalendar(profile.username),
    ]);

    const totalSolved = solvedData?.solvedProblem || 0;
    const easyCount = solvedData?.easySolved || 0;
    const mediumCount = solvedData?.mediumSolved || 0;
    const hardCount = solvedData?.hardSolved || 0;
    const ranking = leetcodeProfile?.ranking || 0;

    let streak = 0;

    const rawCal = calendarData?.submissionCalendar;
    if (rawCal) {
        let cal;
        if (typeof rawCal === "object" && !Array.isArray(rawCal)) {
            cal = rawCal;
        } else if (typeof rawCal === "string") {
            try {
                cal = JSON.parse(rawCal);
            } catch {
                cal = null;
            }
        }

        if (cal) {
            const timestamps = Object.keys(cal).map(Number).sort((a, b) => b - a);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < timestamps.length; i++) {
                const date = new Date(timestamps[i] * 1000);
                date.setHours(0, 0, 0, 0);
                const expected = new Date(today);
                expected.setDate(expected.getDate() - i);
                if (date.getTime() === expected.getTime()) {
                    streak++;
                } else {
                    break;
                }
            }

            await Promise.all(
                Object.entries(cal).map(([ts, submissions]) => {
                    const date = new Date(Number(ts) * 1000);
                    return dailyStatsRepository.upsertDailyStats(userId, date, Number(submissions), 0, 0, 0, 0);
                })
            );
        }
    }

    const existingStats = await problemStatsRepository.findProblemStatsByProfileId(profile.id);

    let stats;

    if (!existingStats) {
        stats = await problemStatsRepository.createProblemStats(profile.id, totalSolved, easyCount, mediumCount, hardCount, 0, ranking, streak);
    } else {
        stats = await problemStatsRepository.updateProblemStats(profile.id, totalSolved, easyCount, mediumCount, hardCount, 0, ranking, streak);
    }

    notificationService.sendNotification(userId, "sync", "LeetCode synced successfully").catch(err => logger.error("Sync notification failed", err));

    return stats;
};

// Sync Codeforces profile and stats for a user
const syncCodeforces = async (userId) => {
    const profile = await profileRepository.findByUserAndPlatform(userId, "codeforces");

    if (!profile) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Codeforces profile not found");
    }

    const codeforcesProfile = await fetchCodeforcesProfile(profile.username);

    const rating = codeforcesProfile.rating || 0;

    const existingStats = await problemStatsRepository.findProblemStatsByProfileId(profile.id);

    if (!existingStats) {
        await problemStatsRepository.createProblemStats(profile.id, 0, 0, 0, 0, rating, 0, 0);
    } else {
        await problemStatsRepository.updateProblemStats(
            profile.id, existingStats.total_solved, existingStats.easy_count,
            existingStats.medium_count, existingStats.hard_count,
            rating, existingStats.ranking, existingStats.streak
        );
    }

    try {
        await contestService.syncContestHistory(userId);
    } catch (error) {
        logger.error("Contest history sync failed", error);
    }

    notificationService.sendNotification(userId, "sync", "Codeforces synced successfully").catch(err => logger.error("Sync notification failed", err));

    return await problemStatsRepository.findProblemStatsByProfileId(profile.id);
};

// Sync CodeChef profile and stats for a user
const syncCodeChef = async (userId) => {
    const profile = await profileRepository.findByUserAndPlatform(userId, "codechef");

    if (!profile) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "CodeChef profile not found");
    }

    const data = await fetchCodeChefProfile(profile.username);

    const codechefRating = data.profile?.currentRating || 0;
    const existingStats = await problemStatsRepository.findProblemStatsByProfileId(profile.id);

    if (!existingStats) {
        const stats = await problemStatsRepository.createProblemStats(profile.id, 0, 0, 0, 0, codechefRating, 0, 0);
        notificationService.sendNotification(userId, "sync", "CodeChef synced successfully").catch(err => logger.error("Sync notification failed", err));
        return stats;
    }

    const stats = await problemStatsRepository.updateProblemStats(
        profile.id, existingStats.total_solved,
        existingStats.easy_count, existingStats.medium_count, existingStats.hard_count,
        codechefRating, existingStats.ranking, existingStats.streak
    );

    notificationService.sendNotification(userId, "sync", "CodeChef synced successfully").catch(err => logger.error("Sync notification failed", err));

    return stats;
};

const syncGFG = async (userId) => {
    const profile = await profileRepository.findByUserAndPlatform(userId, "gfg");

    if (!profile) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "GFG profile not found");
    }

    const gfgProfile = await fetchGFGProfile(profile.username);

    const totalSolved = gfgProfile.totalProblemsSolved || 0;
    const easyCount = gfgProfile.Easy || 0;
    const mediumCount = gfgProfile.Medium || 0;
    const hardCount = gfgProfile.Hard || 0;

    const today = new Date();
    const existingStats = await problemStatsRepository.findProblemStatsByProfileId(profile.id);

    if (!existingStats) {
        const stats = await problemStatsRepository.createProblemStats(profile.id, totalSolved, easyCount, mediumCount, hardCount, 0, 0, 0);
        await dailyStatsRepository.upsertDailyStats(userId, today, totalSolved, easyCount, mediumCount, hardCount, 0);
        notificationService.sendNotification(userId, "sync", "GFG synced successfully").catch(err => logger.error("Sync notification failed", err));
        return stats;
    }

    const stats = await problemStatsRepository.updateProblemStats(profile.id, totalSolved, easyCount, mediumCount, hardCount, existingStats.rating, existingStats.ranking, existingStats.streak);
    await dailyStatsRepository.upsertDailyStats(userId, today, totalSolved, easyCount, mediumCount, hardCount, 0);
    notificationService.sendNotification(userId, "sync", "GFG synced successfully").catch(err => logger.error("Sync notification failed", err));
    return stats;
};

const syncHackerRank = async (userId) => {
    const profile = await profileRepository.findByUserAndPlatform(userId, "hackerrank");

    if (!profile) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "HackerRank profile not found");
    }

    const [hackerRankProfile, badgeData] = await Promise.all([
        fetchHackerRankProfile(profile.username),
        fetchHackerRankBadges(profile.username),
    ]);

    const existingStats = await problemStatsRepository.findProblemStatsByProfileId(profile.id);

    const totalSolved = hackerRankProfile.totalSolved || 0;

    const stars = Array.isArray(badgeData?.badges) && badgeData.badges.length > 0
        ? Math.max(...badgeData.badges.map((b) => parseInt(b.id?.split(":").pop()) || 0), 0)
        : 0;

    const today = new Date();

    if (!existingStats) {
        const result = await problemStatsRepository.createProblemStats(profile.id, totalSolved, 0, 0, 0, 0, stars, 0);
        await dailyStatsRepository.upsertDailyStats(userId, today, totalSolved, 0, 0, 0, 0);
        notificationService.sendNotification(userId, "sync", "HackerRank synced successfully").catch(err => logger.error("Sync notification failed", err));
        return result;
    }

    const result = await problemStatsRepository.updateProblemStats(
        profile.id, totalSolved,
        existingStats.easy_count, existingStats.medium_count, existingStats.hard_count,
        0, stars, existingStats.streak
    );
    await dailyStatsRepository.upsertDailyStats(userId, today, totalSolved, 0, 0, 0, 0);
    notificationService.sendNotification(userId, "sync", "HackerRank synced successfully").catch(err => logger.error("Sync notification failed", err));
    return result;
};


// Sync data from all platforms the user has profiles for
const syncAll = async (userId) => {
    const result = {};

    try {
        result.github = await syncGithub(userId);
    } catch (err) {
        logger.error(`GitHub sync failed for user ${userId}:`, err.stack || err.message);
        result.github = null;
    }

    try {
        result.leetcode = await syncLeetCode(userId);
    } catch (err) {
        logger.error(`LeetCode sync failed for user ${userId}:`, err.stack || err.message);
        result.leetcode = null;
    }

    try {
        result.codeforces = await syncCodeforces(userId);
    } catch (err) {
        logger.error(`Codeforces sync failed for user ${userId}:`, err.stack || err.message);
        result.codeforces = null;
    }

    try {
        result.codechef = await syncCodeChef(userId);
    } catch (err) {
        logger.error(`CodeChef sync failed for user ${userId}:`, err.stack || err.message);
        result.codechef = null;
    }

    try {
        result.gfg = await syncGFG(userId);
    } catch (err) {
        logger.error(`GFG sync failed for user ${userId}:`, err.stack || err.message);
        result.gfg = null;
    }

    try {
        result.hackerRank = await syncHackerRank(userId);
    } catch (err) {
        logger.error(`HackerRank sync failed for user ${userId}:`, err.stack || err.message);
        result.hackerRank = null;
    }

    return result;
};

module.exports = {
    syncGithub,
    syncLeetCode,
    syncCodeforces,
    syncCodeChef,
    syncGFG,
    syncHackerRank,
    syncAll,
};
