const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["manga", "novel"], required: true },
    coverUrl: { type: String, default: "" },
    coverPublicId: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    tags: [{ type: String, trim: true }],
    views: { type: Number, default: 0 },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

seriesSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Series", seriesSchema);
