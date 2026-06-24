const express = require("express");

const publicProfileController = require("../controllers/publicProfileController");
const apiLimiter = require("../middlewares/apiLimiter");

const router = express.Router();

router.get("/:username", apiLimiter, publicProfileController.getPublicProfile);

module.exports = router;