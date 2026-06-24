const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");

const profileRepository = require("../repositories/profileRepository");

// Add a new coding profile for a user
const addProfile = async (userId, platform, username, profileUrl = null) => {
    const existingProfile = await profileRepository.findByUserAndPlatform(userId, platform);

    if (existingProfile) {
        throw new ApiError(HTTP_STATUS.CONFLICT, "Profile already exists");
    }

    return await profileRepository.createProfile(userId, platform, username, profileUrl);
};

// Get all coding profiles for a user (with pagination)
const getProfiles = async (userId, page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    const rows = await profileRepository.findByUserId(userId, limit, offset);
    const total = await profileRepository.countByUserId(userId);

    return {
        data: rows,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};

// Update a profile's username and profile URL (with ownership check)
const updateProfile = async (userId, profileId, username, profileUrl) => {
    const profile = await profileRepository.findById(profileId);

    if (!profile) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Profile not found");
    }

    if (profile.user_id !== userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    return await profileRepository.updateProfile(profileId, username, profileUrl);
};

// Delete a profile (with ownership check)
const removeProfile = async (userId, profileId) => {
    const profile = await profileRepository.findById(profileId);

    if (!profile) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Profile not found");
    }

    if (profile.user_id !== userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    await profileRepository.deleteProfile(profileId);
};

module.exports = {
    addProfile,
    getProfiles,
    updateProfile,
    removeProfile,
};
