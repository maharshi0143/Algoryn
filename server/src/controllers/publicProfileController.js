const publicProfileService = require("../services/publicProfileService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

const getPublicProfile = asyncHandler(async (req, res) => {
    const profile = await publicProfileService.getPublicProfile(req.params.username);

    apiResponse(res, HTTP_STATUS.OK, "Public profile fetched successfully", profile);
});

module.exports = {
    getPublicProfile,
};