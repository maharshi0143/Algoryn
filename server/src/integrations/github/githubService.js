const axios = require("axios");
const logger = require("../../utils/logger");

const BASE_URL = "https://api.github.com";
const GRAPHQL_URL = "https://api.github.com/graphql";

const getHeaders = () => {
    const headers = {};
    const token = process.env.GITHUB_TOKEN;
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
};

const fetchAllPages = async (url, maxPages = 5) => {
    const results = [];
    let page = 1;

    while (page <= maxPages) {
        const { data } = await axios.get(`${url}&page=${page}`, { timeout: 15000, headers: getHeaders() });
        if (!data || data.length === 0) break;
        results.push(...data);
        if (data.length < 100) break;
        page++;
    }

    return results;
};

const fetchGithubProfile = async (username) => {
    try {
        const { data } = await axios.get(`${BASE_URL}/users/${username}`, { timeout: 10000, headers: getHeaders() });
        return data;
    } catch (error) {
        const err = new Error(`GitHub API error: ${error.message}`);
        err.statusCode = error.response?.status || 503;
        throw err;
    }
};

const fetchGithubRepositories = async (username) => {
    try {
        return await fetchAllPages(`${BASE_URL}/users/${username}/repos?per_page=100`);
    } catch (error) {
        const err = new Error(`GitHub API error: ${error.message}`);
        err.statusCode = error.response?.status || 503;
        throw err;
    }
};

const fetchGithubContributions = async (username) => {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
        logger.warn("GITHUB_TOKEN not set — contributions will be 0");
        return 0;
    }

    const query = `
        query($username: String!) {
            user(login: $username) {
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                    }
                }
            }
        }
    `;

    try {
        const { data } = await axios.post(
            GRAPHQL_URL,
            { query, variables: { username } },
            {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
            }
        );

        return data.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions ?? 0;
    } catch (error) {
        const err = new Error(`GitHub GraphQL error for ${username}: ${error.message}`);
        err.statusCode = error.response?.status || 503;
        throw err;
    }
};

module.exports = {
    fetchGithubProfile,
    fetchGithubRepositories,
    fetchGithubContributions,
};
