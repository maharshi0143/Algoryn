const express = require("express");

const dashboardController = require("../controllers/dashboardController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Dashboard routes — overview, weekly, monthly, heatmap
router.get("/", protect, dashboardController.getOverview);
router.get("/charts", protect, dashboardController.getCharts);
router.get("/weekly", protect, dashboardController.getWeeklyStats);
router.get("/monthly", protect, dashboardController.getMonthlyStats);
router.get("/heatmap", protect, dashboardController.getHeatmapStats);

module.exports = router;
