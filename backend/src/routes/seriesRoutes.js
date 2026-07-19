const express = require("express");
const {
  listPublic,
  getPublicBySlug,
} = require("../controllers/seriesController");
const { getPublicChapter } = require("../controllers/chapterController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public catalog is open; reading chapters requires registration
router.get("/", listPublic);
router.get("/:slug", getPublicBySlug);
router.get("/:slug/chapters/:number", protect, getPublicChapter);

module.exports = router;
