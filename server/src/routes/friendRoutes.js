const express = require("express");

const friendController =
    require("../controllers/friendController");

const {
    sendFriendRequestValidator
} = require("../validators/friendValidator");

const validate =
    require("../middlewares/validate");

const {
    protect
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    sendFriendRequestValidator,
    validate,
    friendController.sendFriendRequest
);

router.get(
    "/",
    protect,
    friendController.getFriends
);

router.get(
    "/pending",
    protect,
    friendController.getPendingRequests
);

router.patch(
    "/:id/accept",
    protect,
    friendController.acceptFriendRequest
);

router.patch(
    "/:id/reject",
    protect,
    friendController.rejectFriendRequest
);

router.patch(
    "/:id/block",
    protect,
    friendController.blockFriend
);

router.delete(
    "/:id",
    protect,
    friendController.removeFriend
);

module.exports = router;
