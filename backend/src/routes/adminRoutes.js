const express = require("express");
const {
  listAdmin,
  getAdminById,
  createSeries,
  updateSeries,
  deleteSeries,
} = require("../controllers/seriesController");
const {
  createChapter,
  updateChapter,
  deleteChapter,
  listBySeriesAdmin,
} = require("../controllers/chapterController");
const { dashboard } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/dashboard", dashboard);
router.get("/series", listAdmin);
router.get("/series/:seriesId/chapters", listBySeriesAdmin);
router.get("/series/:id", getAdminById);
router.post("/series", upload.single("cover"), createSeries);
router.patch("/series/:id", upload.single("cover"), updateSeries);
router.delete("/series/:id", deleteSeries);

router.post(
  "/series/:seriesId/chapters",
  upload.array("pages", 120),
  createChapter
);
router.patch("/chapters/:id", upload.array("pages", 120), updateChapter);
router.delete("/chapters/:id", deleteChapter);

module.exports = router;
