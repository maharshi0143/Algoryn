const axios = require("axios");

const BASE_URL = "https://codeforces.com/api";

const fetchCodeforcesProfile = async (handle) => {
    const { data } = await axios.get(`${BASE_URL}/user.info?handles=${handle}`, {
        timeout: 10000,
        validateStatus: status => status === 200 || status === 400,
    });

    if (data.status === "FAILED" || !data.result?.length) {
        const err = new Error(`Codeforces user not found: ${handle}`);
        err.statusCode = 404;
        throw err;
    }

    return data.result[0];
};

const fetchCodeforcesRatingHistory = async (handle) => {
    const { data } = await axios.get(`${BASE_URL}/user.rating?handle=${handle}`, {
        timeout: 10000,
        validateStatus: status => status === 200 || status === 400,
    });

    if (data.status === "FAILED" || !data.result) {
        const err = new Error(`Codeforces user not found: ${handle}`);
        err.statusCode = 404;
        throw err;
    }

    return data.result;
};

const fetchCodeforcesUpcomingContests = async () => {
    const { data } = await axios.get(`${BASE_URL}/contest.list?gym=false`, { timeout: 10000 });
    const now = Math.floor(Date.now() / 1000);
    return data.result
        .filter(c => c.phase === "BEFORE")
        .map(c => ({
            contestName: c.name,
            platform: "codeforces",
            startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
            duration: c.durationSeconds,
            url: `https://codeforces.com/contest/${c.id}`,
        }))
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
};

module.exports = {
    fetchCodeforcesProfile,
    fetchCodeforcesRatingHistory,
    fetchCodeforcesUpcomingContests,
};
