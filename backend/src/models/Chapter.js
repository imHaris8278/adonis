const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Series",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    number: { type: Number, required: true },
    // Novel chapters store rich text / plain text here
    content: { type: String, default: "" },
    // Manga chapters store ordered page images here
    pages: [pageSchema],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

chapterSchema.index({ series: 1, number: 1 }, { unique: true });

module.exports = mongoose.model("Chapter", chapterSchema);
