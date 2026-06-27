const axios = require("axios");
const HTTP_STATUS = require("../../constants/httpStatus");

const BASE_URL = "https://gfg-stats.tashif.codes";

const fetchGFGProfile = async (username) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/${username}`, { timeout: 10000 });
        return data;
    } catch (error) {
        const status = error.response?.status;
        let message;
        if (status === 404) {
            message = `GFG user "${username}" not found. Please check your username.`;
        } else if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
            message = "GFG API is temporarily unavailable. Please try again later.";
        } else {
            message = `Failed to sync GeeksforGeeks: ${error.message}`;
        }
        const err = new Error(message);
        err.statusCode = status || HTTP_STATUS.SERVICE_UNAVAILABLE;
        throw err;
    }
};

module.exports = {
    fetchGFGProfile,
};
