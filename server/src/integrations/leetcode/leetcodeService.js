const axios = require("axios");
const HTTP_STATUS = require("../../constants/httpStatus");

const BASE_URL = "https://alfa-leetcode-api.onrender.com";

const checkLeetCodeError = (data, username) => {
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const msg = data.errors[0]?.message || "Unknown error";
        const err = new Error(`LeetCode user "${username}" not found: ${msg}`);
        err.statusCode = HTTP_STATUS.NOT_FOUND;
        throw err;
    }
    if (data?.data?.matchedUser === null) {
        const err = new Error(`LeetCode user "${username}" not found`);
        err.statusCode = HTTP_STATUS.NOT_FOUND;
        throw err;
    }
};

const fetchLeetCodeProfile = async (username) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/${username}`, { timeout: 10000 });
        checkLeetCodeError(data, username);
        return data;
    } catch (error) {
        if (error.statusCode) throw error;
        const err = new Error(`LeetCode API error: ${error.message}`);
        err.statusCode = error.response?.status || HTTP_STATUS.SERVICE_UNAVAILABLE;
        throw err;
    }
};

const fetchLeetCodeSolved = async (username) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/${username}/solved`, { timeout: 10000 });
        checkLeetCodeError(data, username);
        return data;
    } catch (error) {
        if (error.statusCode) throw error;
        const err = new Error(`LeetCode solved API error: ${error.message}`);
        err.statusCode = error.response?.status || HTTP_STATUS.SERVICE_UNAVAILABLE;
        throw err;
    }
};

const fetchLeetCodeCalendar = async (username) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/${username}/calendar`, { timeout: 10000 });
        checkLeetCodeError(data, username);
        return data;
    } catch (error) {
        if (error.statusCode) throw error;
        const err = new Error(`LeetCode calendar API error: ${error.message}`);
        err.statusCode = error.response?.status || HTTP_STATUS.SERVICE_UNAVAILABLE;
        throw err;
    }
};

module.exports = {
    fetchLeetCodeProfile,
    fetchLeetCodeSolved,
    fetchLeetCodeCalendar,
};
