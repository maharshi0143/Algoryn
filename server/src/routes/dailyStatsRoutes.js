const express = require("express");

const dailyStatsController = require("../controllers/dailyStatsController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, dailyStatsController.getDailyStats);
router.post("/populate", protect, dailyStatsController.populateDailyStats);

module.exports = router;