const axios = require("axios");

const BASE_URL = "https://codechef-stats-api-two.vercel.app";

const fetchCodeChefProfile = async (username) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/profile/${username}`, { timeout: 10000 });
        return data;
    } catch (error) {
        const err = new Error(`CodeChef API error: ${error.message}`);
        err.statusCode = error.response?.status || 503;
        throw err;
    }
};

module.exports = {
    fetchCodeChefProfile,
};
