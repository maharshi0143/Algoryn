const express = require("express");

const aiController = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");
const aiLimiter = require("../middlewares/aiLimiter");

const router = express.Router();

router.use(protect);

router.get("/insights", aiLimiter, aiController.getInsights);
router.get("/recommendations", aiLimiter, aiController.getRecommendations);
router.get("/weakness", aiLimiter, aiController.getWeakness);

module.exports = router;
