const Series = require("../models/Series");
const Chapter = require("../models/Chapter");

async function createChapter(req, res, next) {
  try {
    const series = await Series.findById(req.params.seriesId);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    const { title, number, content, status } = req.body;
    if (!title || number === undefined) {
      return res.status(400).json({ message: "Title and number are required" });
    }

    const chapterNumber = Number(number);
    if (Number.isNaN(chapterNumber) || chapterNumber < 1) {
      return res.status(400).json({ message: "Chapter number must be a positive number" });
    }

    let pages = [];
    if (series.type === "manga") {
      const files = req.files || [];
      if (!files.length) {
        return res.status(400).json({ message: "At least one page image is required for manga" });
      }
      pages = files.map((file, index) => ({
        imageUrl: file.path || file.secure_url,
        publicId: file.filename || file.public_id || "",
        order: index,
      }));
    } else if (!content || !String(content).trim()) {
      return res.status(400).json({ message: "Content is required for novel chapters" });
    }

    const chapter = await Chapter.create({
      series: series._id,
      title,
      number: chapterNumber,
      content: series.type === "novel" ? content : "",
      pages,
      status: status === "published" ? "published" : "draft",
    });

    res.status(201).json({ chapter });
  } catch (err) {
    next(err);
  }
}

async function updateChapter(req, res, next) {
  try {
    const chapter = await Chapter.findById(req.params.id).populate("series");
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const { title, number, content, status } = req.body;
    if (title) chapter.title = title;
    if (number !== undefined) {
      const n = Number(number);
      if (Number.isNaN(n) || n < 1) {
        return res.status(400).json({ message: "Invalid chapter number" });
      }
      chapter.number = n;
    }
    if (status === "draft" || status === "published") chapter.status = status;

    if (chapter.series.type === "novel" && content !== undefined) {
      chapter.content = content;
    }

    if (chapter.series.type === "manga" && req.files?.length) {
      const newPages = req.files.map((file, index) => ({
        imageUrl: file.path || file.secure_url,
        publicId: file.filename || file.public_id || "",
        order: chapter.pages.length + index,
      }));
      chapter.pages.push(...newPages);
    }

    await chapter.save();
    res.json({ chapter });
  } catch (err) {
    next(err);
  }
}

async function deleteChapter(req, res, next) {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    await chapter.deleteOne();
    res.json({ message: "Chapter deleted" });
  } catch (err) {
    next(err);
  }
}

async function listBySeriesAdmin(req, res, next) {
  try {
    const chapters = await Chapter.find({ series: req.params.seriesId })
      .sort({ number: 1 })
      .lean();
    res.json({ chapters });
  } catch (err) {
    next(err);
  }
}

async function getPublicChapter(req, res, next) {
  try {
    const series = await Series.findOne({
      slug: req.params.slug,
      status: "published",
    });
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    const chapterNumber = Number(req.params.number);
    if (Number.isNaN(chapterNumber) || chapterNumber < 1) {
      return res.status(400).json({ message: "Invalid chapter number" });
    }

    const chapter = await Chapter.findOne({
      series: series._id,
      number: chapterNumber,
      status: "published",
    }).lean();

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    await Chapter.updateOne({ _id: chapter._id }, { $inc: { views: 1 } });
    await Series.updateOne({ _id: series._id }, { $inc: { views: 1 } });

    const siblings = await Chapter.find({
      series: series._id,
      status: "published",
    })
      .sort({ number: 1 })
      .select("number title")
      .lean();

    res.json({
      series: {
        id: series._id,
        title: series.title,
        slug: series.slug,
        type: series.type,
      },
      chapter: { ...chapter, views: chapter.views + 1 },
      chapters: siblings,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createChapter,
  updateChapter,
  deleteChapter,
  listBySeriesAdmin,
  getPublicChapter,
};
