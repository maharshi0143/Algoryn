const express = require("express");

const achievementController = require("../controllers/achievementController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Achievement routes — list achievements, check for new unlocks
router.get("/", protect, achievementController.getAchievements);
router.post("/", protect, achievementController.checkAchievements);

module.exports = router;
