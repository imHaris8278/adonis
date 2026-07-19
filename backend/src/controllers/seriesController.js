const Series = require("../models/Series");
const Chapter = require("../models/Chapter");

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(title, excludeId = null) {
  let base = slugify(title) || "series";
  let slug = base;
  let i = 1;
  while (true) {
    const existing = await Series.findOne({ slug }).select("_id").lean();
    if (!existing || (excludeId && String(existing._id) === String(excludeId))) {
      return slug;
    }
    slug = `${base}-${i++}`;
  }
}

async function listPublic(req, res, next) {
  try {
    const { type, q } = req.query;
    const filter = { status: "published" };
    if (type === "manga" || type === "novel") filter.type = type;

    if (q && String(q).trim()) {
      const term = String(q).trim();
      filter.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { tags: { $regex: term, $options: "i" } },
      ];
    }

    const series = await Series.find(filter)
      .sort({ updatedAt: -1 })
      .select("-coverPublicId")
      .lean();

    res.json({ series });
  } catch (err) {
    next(err);
  }
}

async function getPublicBySlug(req, res, next) {
  try {
    const series = await Series.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .populate("author", "name")
      .lean();

    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    const chapters = await Chapter.find({
      series: series._id,
      status: "published",
    })
      .sort({ number: 1 })
      .select("title number views createdAt")
      .lean();

    res.json({ series, chapters });
  } catch (err) {
    next(err);
  }
}

async function createSeries(req, res, next) {
  try {
    const { title, description, type, tags, status } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: "Title and type are required" });
    }
    if (!["manga", "novel"].includes(type)) {
      return res.status(400).json({ message: "Type must be manga or novel" });
    }

    const slug = await uniqueSlug(title);
    const tagList = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

    const series = await Series.create({
      title,
      slug,
      description: description || "",
      type,
      tags: tagList,
      status: status === "published" ? "published" : "draft",
      coverUrl: req.file?.path || req.file?.secure_url || "",
      coverPublicId: req.file?.filename || req.file?.public_id || "",
      author: req.user._id,
    });

    res.status(201).json({ series });
  } catch (err) {
    next(err);
  }
}

async function updateSeries(req, res, next) {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    const { title, description, tags, status } = req.body;

    if (title && title !== series.title) {
      series.title = title;
      series.slug = await uniqueSlug(title, series._id);
    }
    if (description !== undefined) series.description = description;
    if (status === "draft" || status === "published") series.status = status;
    if (tags !== undefined) {
      series.tags = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
    }
    if (req.file) {
      series.coverUrl = req.file.path || req.file.secure_url || series.coverUrl;
      series.coverPublicId =
        req.file.filename || req.file.public_id || series.coverPublicId;
    }

    await series.save();
    res.json({ series });
  } catch (err) {
    next(err);
  }
}

async function deleteSeries(req, res, next) {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    await Chapter.deleteMany({ series: series._id });
    await series.deleteOne();
    res.json({ message: "Series deleted" });
  } catch (err) {
    next(err);
  }
}

async function listAdmin(req, res, next) {
  try {
    const series = await Series.find()
      .sort({ updatedAt: -1 })
      .populate("author", "name email")
      .lean();

    const withChapterCounts = await Promise.all(
      series.map(async (s) => {
        const chapterCount = await Chapter.countDocuments({ series: s._id });
        return { ...s, chapterCount };
      })
    );

    res.json({ series: withChapterCounts });
  } catch (err) {
    next(err);
  }
}

async function getAdminById(req, res, next) {
  try {
    const series = await Series.findById(req.params.id)
      .populate("author", "name email")
      .lean();

    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    const chapterCount = await Chapter.countDocuments({ series: series._id });
    res.json({ series: { ...series, chapterCount } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPublic,
  getPublicBySlug,
  createSeries,
  updateSeries,
  deleteSeries,
  listAdmin,
  getAdminById,
};
