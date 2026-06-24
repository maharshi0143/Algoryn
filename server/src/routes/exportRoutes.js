const express = require("express");

const exportController = require("../controllers/exportController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/pdf", protect, exportController.exportPdf);
router.get("/json", protect, exportController.exportJson);
router.get("/png", protect, exportController.exportPng);

module.exports = router;