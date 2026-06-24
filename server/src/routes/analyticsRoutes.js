const express = require("express");

const analyticsController = require("../controllers/analyticsController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Analytics routes — platforms, difficulty, contributions, yearly
router.get("/platforms", protect, analyticsController.getPlatformComparison);
router.get("/difficulty", protect, analyticsController.getDifficultyDistribution);
router.get("/contributions", protect, analyticsController.getContributionTrend);
router.get("/yearly", protect, analyticsController.getYearlyProgress);

module.exports = router;
