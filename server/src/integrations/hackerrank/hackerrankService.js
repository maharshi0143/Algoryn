const axios = require("axios");

const BASE_URL = "https://hackerrank-stats-api.vercel.app";

const fetchHackerRankProfile = async (username) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/${username}`, { timeout: 10000 });
        return data;
    } catch (error) {
        const err = new Error(`HackerRank API error: ${error.message}`);
        err.statusCode = error.response?.status || 503;
        throw err;
    }
};

const fetchHackerRankBadges = async (username) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/${username}/badges`, { timeout: 10000 });
        return data;
    } catch (error) {
        const err = new Error(`HackerRank API error: ${error.message}`);
        err.statusCode = error.response?.status || 503;
        throw err;
    }
};

module.exports = {
    fetchHackerRankProfile,
    fetchHackerRankBadges,
};
