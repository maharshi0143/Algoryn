const express = require("express");

const reportController = require("../controllers/reportController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/generate", protect, reportController.generateWeeklyReport);

module.exports = router;