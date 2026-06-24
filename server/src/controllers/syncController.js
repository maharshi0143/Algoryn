const syncService = require("../services/syncService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

// Sync GitHub stats for the authenticated user
const syncGithub = asyncHandler(async (req, res) => {
    const githubStats = await syncService.syncGithub(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "GitHub stats synced successfully", githubStats);
});

// Sync LeetCode stats for the authenticated user
const syncLeetCode = asyncHandler(async (req, res) => {
    const stats = await syncService.syncLeetCode(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "LeetCode synced successfully", stats);
});

// Sync Codeforces stats for the authenticated user
const syncCodeforces = asyncHandler(async (req, res) => {
    const stats = await syncService.syncCodeforces(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Codeforces synced successfully", stats);
});

// Sync CodeChef stats for the authenticated user
const syncCodeChef = asyncHandler(async (req, res) => {
    const stats = await syncService.syncCodeChef(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "CodeChef synced successfully", stats);
});

// Sync stats from all connected platforms
const syncAll = asyncHandler(async (req, res) => {
    const result = await syncService.syncAll(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "All platforms synced successfully", result);
});

const syncGFG = asyncHandler(async (req, res) => {
    const data = await syncService.syncGFG(req.user.id);
    apiResponse(res, HTTP_STATUS.OK, "GFG synced successfully", data);
});

const syncHackerRank = asyncHandler(async (req, res) => {
    const data = await syncService.syncHackerRank(req.user.id);
    apiResponse(res, HTTP_STATUS.OK, "HackerRank synced successfully", data);
});

module.exports = {
    syncGithub,
    syncLeetCode,
    syncCodeforces,
    syncCodeChef,
    syncGFG,
    syncHackerRank,
    syncAll,
};


