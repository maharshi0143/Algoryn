const axios = require("axios");
const HTTP_STATUS = require("../../constants/httpStatus");

const BASE_URL = "https://codechef-stats-api-two.vercel.app";

const fetchCodeChefProfile = async (username) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/profile/${username}`, { timeout: 10000 });
        return data;
    } catch (error) {
        const err = new Error(`CodeChef API error: ${error.message}`);
        err.statusCode = error.response?.status || HTTP_STATUS.SERVICE_UNAVAILABLE;
        throw err;
    }
};

module.exports = {
    fetchCodeChefProfile,
};
