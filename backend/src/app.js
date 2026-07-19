const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const seriesRoutes = require("./routes/seriesRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.set("trust proxy", 1);

function allowedOrigins() {
  const raw =
    process.env.CLIENT_URL ||
    "http://localhost:3000,http://127.0.0.1:3000";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const serveFrontend =
  process.env.NODE_ENV === "production" ||
  process.env.SERVE_FRONTEND === "true";

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin Heroku deploy + local tools
      if (!origin || serveFrontend) {
        return callback(null, true);
      }
      const allowed = allowedOrigins();
      if (allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "adonis-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/series", seriesRoutes);
app.use("/api/admin", adminRoutes);

// Only expose JSON root when API is running alone (local backend)
if (!serveFrontend) {
  app.get("/", (_req, res) => {
    res.json({
      service: "adonis-api",
      ok: true,
      docs: "/api/health",
    });
  });
}

app.use(errorHandler);

module.exports = app;
