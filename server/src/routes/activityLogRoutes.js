const express = require("express");

const activityLogController = require("../controllers/activityLogController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, activityLogController.getRecentActivities);

module.exports = router;
