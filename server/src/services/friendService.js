const ApiError = require("../utils/ApiError");
const HTTP_STATUS = require("../constants/httpStatus");
const logger = require("../utils/logger");

const friendRepository = require("../repositories/friendRepository");
const userRepository = require("../repositories/userRepository");
const notificationService = require("./notificationService");

const sendFriendRequest = async (userId, friendEmail) => {
    let friend;
    try {
        friend = await userRepository.findUserByEmail(friendEmail);
    } catch (error) {
        logger.error("Database error finding user", error);
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Database error finding user");
    }

    if (!friend) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "User not found");
    }

    if (friend.id === userId) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cannot send request to yourself");
    }

    let existingFriendship;
    try {
        existingFriendship = await friendRepository.findFriendship(userId, friend.id);
    } catch (error) {
        logger.error("Database error checking friendship", error);
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Database error checking friendship");
    }

    if (existingFriendship) {
        throw new ApiError(HTTP_STATUS.CONFLICT, "Friendship already exists");
    }

    let friendship;
    try {
        friendship = await friendRepository.sendFriendRequest(userId, friend.id);
    } catch (error) {
        logger.error("Failed to send friend request", error);
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to send friend request");
    }

    try {
        await notificationService.sendNotification(friend.id, "friend", "You received a friend request");
    } catch (error) {
        logger.error("Failed to send notification", error);
    }

    return friendship;
};

const getFriends = async (userId) => {
    try {
        return await friendRepository.findFriendsByUserId(userId);
    } catch {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Database error fetching friends");
    }
};

const getPendingRequests = async (userId) => {
    try {
        return await friendRepository.findPendingRequests(userId);
    } catch {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Database error fetching requests");
    }
};

const acceptFriendRequest = async (userId, friendshipId) => {
    let friendship;
    try {
        friendship = await friendRepository.findFriendById(friendshipId);
    } catch {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Database error");
    }

    if (!friendship) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Friend request not found");
    }

    if (friendship.friend_id !== userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    if (friendship.status !== "pending") {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Friend request is not pending");
    }

    return await friendRepository.acceptFriendRequest(friendshipId);
};

const rejectFriendRequest = async (userId, friendshipId) => {
    let friendship;
    try {
        friendship = await friendRepository.findFriendById(friendshipId);
    } catch {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Database error");
    }

    if (!friendship) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Friend request not found");
    }

    if (friendship.friend_id !== userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    if (friendship.status !== "pending") {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Friend request is not pending");
    }

    try {
        return await friendRepository.rejectFriendRequest(friendshipId);
    } catch {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to reject request");
    }
};

const blockFriend = async (userId, friendshipId) => {
    let friendship;
    try {
        friendship = await friendRepository.findFriendById(friendshipId);
    } catch {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Database error");
    }

    if (!friendship) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Friendship not found");
    }

    if (friendship.user_id !== userId && friendship.friend_id !== userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    return await friendRepository.blockFriend(friendshipId);
};

const removeFriend = async (userId, friendshipId) => {
    let friendship;
    try {
        friendship = await friendRepository.findFriendById(friendshipId);
    } catch {
        throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Database error");
    }

    if (!friendship) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, "Friendship not found");
    }

    if (friendship.user_id !== userId && friendship.friend_id !== userId) {
        throw new ApiError(HTTP_STATUS.FORBIDDEN, "Access denied");
    }

    await friendRepository.deleteFriend(friendshipId);
};

module.exports = {
    sendFriendRequest,
    getFriends,
    getPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    blockFriend,
    removeFriend,
};
