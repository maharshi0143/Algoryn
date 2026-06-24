const axios = require("axios");

const BASE_URL = "https://alfa-leetcode-api.onrender.com";

const fetchLeetCodeProfile = async (username) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/${username}`, { timeout: 10000 });
        return data;
    } catch (error) {
        const err = new Error(`LeetCode API error: ${error.message}`);
        err.statusCode = error.response?.status || 503;
        throw err;
    }
};

module.exports = {
    fetchLeetCodeProfile,
};
