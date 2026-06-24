const express = require("express");

const contestController = require("../controllers/contestController");
const { protect } = require("../middlewares/authMiddleware");
const apiLimiter = require("../middlewares/apiLimiter");

const router = express.Router();

// Contest routes — fetch contest history, upcoming contests, and rating graph
router.get("/", protect, contestController.getContestHistory);
router.get("/upcoming", apiLimiter, contestController.getUpcomingContests);
router.get("/rating", protect, contestController.getRatingGraph);
router.post("/sync", protect, contestController.syncContestHistory);

module.exports = router;