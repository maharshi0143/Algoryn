const express = require("express");

const profileController = require("../controllers/profileController");
const { createProfileValidator, updateProfileValidator } = require("../validators/profileValidator");
const validate = require("../middlewares/validate");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Profile routes — CRUD for coding profiles
router.post("/", protect, createProfileValidator, validate, profileController.createProfile);
router.get("/", protect, profileController.getProfiles);
router.put("/:id", protect, updateProfileValidator, validate, profileController.updateProfile);
router.delete("/:id", protect, profileController.deleteProfile);

module.exports = router;
