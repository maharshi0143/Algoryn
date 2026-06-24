const friendService = require("../services/friendService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

const sendFriendRequest = asyncHandler(async (req, res) => {
    const { friendEmail } = req.body;
    const friendship = await friendService.sendFriendRequest(req.user.id, friendEmail);
    apiResponse(res, HTTP_STATUS.CREATED, "Friend request sent successfully", friendship);
});

const getFriends = asyncHandler(async (req, res) => {
    const friends = await friendService.getFriends(req.user.id);
    apiResponse(res, HTTP_STATUS.OK, "Friends fetched successfully", friends);
});

const getPendingRequests = asyncHandler(async (req, res) => {
    const requests = await friendService.getPendingRequests(req.user.id);
    apiResponse(res, HTTP_STATUS.OK, "Pending requests fetched successfully", requests);
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
    const friendship = await friendService.acceptFriendRequest(req.user.id, req.params.id);
    apiResponse(res, HTTP_STATUS.OK, "Friend request accepted successfully", friendship);
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
    const friendship = await friendService.rejectFriendRequest(req.user.id, req.params.id);
    apiResponse(res, HTTP_STATUS.OK, "Friend request rejected successfully", friendship);
});

const blockFriend = asyncHandler(async (req, res) => {
    const friendship = await friendService.blockFriend(req.user.id, req.params.id);
    apiResponse(res, HTTP_STATUS.OK, "Friend blocked successfully", friendship);
});

const removeFriend = asyncHandler(async (req, res) => {
    await friendService.removeFriend(req.user.id, req.params.id);
    apiResponse(res, HTTP_STATUS.OK, "Friend removed successfully");
});

module.exports = {
    sendFriendRequest,
    getFriends,
    getPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    blockFriend,
    removeFriend,
};
