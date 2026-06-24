const express = require("express");

const leaderboardController = require("../controllers/leaderboardController");
const { protect } = require("../middlewares/authMiddleware");
const apiLimiter = require("../middlewares/apiLimiter");

const router = express.Router();

router.use(apiLimiter);

router.get("/", leaderboardController.getGlobalLeaderboard);
router.get("/friends", protect, leaderboardController.getFriendsLeaderboard);
router.get("/platform/:platform", leaderboardController.getPlatformLeaderboard);
router.get("/streaks", leaderboardController.getTopStreaks);
router.get("/contributions", leaderboardController.getTopContributors);

module.exports = router;