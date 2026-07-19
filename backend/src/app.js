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
  const raw = process.env.CLIENT_URL || "http://localhost:3000";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

app.use(
  cors({
    origin(origin, callback) {
      const allowed = allowedOrigins();
      // Allow non-browser tools (no Origin) and listed frontends
      if (!origin || allowed.includes(origin)) {
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

app.get("/", (_req, res) => {
  res.json({
    service: "wasi-api",
    ok: true,
    docs: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "wasi-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/series", seriesRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

module.exports = app;
