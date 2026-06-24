const express = require("express");

const goalController = require("../controllers/goalController");
const { createGoalValidator, updateGoalValidator } = require("../validators/goalValidator");
const { protect } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");

const router = express.Router();

router.use(protect);

router.post("/", createGoalValidator, validate, goalController.createGoal);
router.get("/", goalController.getGoals);
router.patch("/:id/progress", updateGoalValidator, validate, goalController.updateGoalProgress);
router.get("/:id", goalController.getGoalById);
router.delete("/:id", goalController.deleteGoal);

module.exports = router;
