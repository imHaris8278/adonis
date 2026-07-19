const Series = require("../models/Series");
const Chapter = require("../models/Chapter");
const User = require("../models/User");

async function dashboard(_req, res, next) {
  try {
    const [users, seriesCount, chapters, manga, novels, topSeries] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        Series.countDocuments(),
        Chapter.countDocuments(),
        Series.countDocuments({ type: "manga" }),
        Series.countDocuments({ type: "novel" }),
        Series.find()
          .sort({ views: -1 })
          .limit(10)
          .select("title type views status slug coverUrl updatedAt")
          .lean(),
      ]);

    const totalViews = await Series.aggregate([
      { $group: { _id: null, views: { $sum: "$views" } } },
    ]);

    res.json({
      stats: {
        users,
        series: seriesCount,
        chapters,
        manga,
        novels,
        totalViews: totalViews[0]?.views || 0,
      },
      topSeries,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard };
