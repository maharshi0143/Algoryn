const express = require("express");

const syncController = require("../controllers/syncController");
const { protect } = require("../middlewares/authMiddleware");
const syncLimiter = require("../middlewares/syncLimiter");

const router = express.Router();

// Sync routes — trigger manual data sync for coding profiles
router.post("/github", protect, syncLimiter, syncController.syncGithub);
router.post("/leetcode", protect, syncLimiter, syncController.syncLeetCode);
router.post("/codeforces", protect, syncLimiter, syncController.syncCodeforces);
router.post("/codechef", protect, syncLimiter, syncController.syncCodeChef);
router.post("/all", protect, syncLimiter, syncController.syncAll);
router.post("/gfg", protect, syncLimiter, syncController.syncGFG);
router.post("/hackerrank", protect, syncLimiter, syncController.syncHackerRank);

module.exports = router;
