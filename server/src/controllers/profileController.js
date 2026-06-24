const profileService = require("../services/profileService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

// Create profile
const createProfile = asyncHandler(async (req, res) => {
    const { platform, username, profileUrl } = req.body;
    const profile = await profileService.addProfile(req.user.id, platform, username, profileUrl);

    apiResponse(res, HTTP_STATUS.CREATED, "Profile created successfully", profile);
});

// Get all profiles for the user
const getProfiles = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const result = await profileService.getProfiles(req.user.id, page, limit);

    apiResponse(res, HTTP_STATUS.OK, "Profiles fetched successfully", result);
});

// Update profile
const updateProfile = asyncHandler(async (req, res) => {
    const { username, profileUrl } = req.body;
    const profile = await profileService.updateProfile(req.user.id, req.params.id, username, profileUrl);

    apiResponse(res, HTTP_STATUS.OK, "Profile updated successfully", profile);
});

// Delete profile
const deleteProfile = asyncHandler(async (req, res) => {
    await profileService.removeProfile(req.user.id, req.params.id);

    apiResponse(res, HTTP_STATUS.OK, "Profile deleted successfully");
});

module.exports = {
    createProfile,
    getProfiles,
    updateProfile,
    deleteProfile,
};