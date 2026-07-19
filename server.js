require("dotenv").config({
  path: require("path").join(__dirname, "backend", ".env"),
});

const fs = require("fs");
const path = require("path");
const connectDB = require("./backend/src/config/db");
const app = require("./backend/src/app");

const PORT = process.env.PORT || 3000;

async function attachNext() {
  const frontendDir = path.join(__dirname, "frontend");
  const nextDir = path.join(frontendDir, ".next");
  const nextPkg = path.join(frontendDir, "node_modules", "next");

  if (!fs.existsSync(nextPkg)) {
    throw new Error(`Next.js not found at ${nextPkg}. Build may have failed.`);
  }
  if (!fs.existsSync(nextDir)) {
    throw new Error(`Next build missing at ${nextDir}. heroku-postbuild must run next build.`);
  }

  const next = require(nextPkg);
  const nextApp = next({
    dev: false,
    dir: frontendDir,
  });
  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();
  app.use((req, res) => handle(req, res));
  console.log("Next.js frontend attached");
}

async function start() {
  console.log("Starting Adonis...", {
    node: process.version,
    dyno: process.env.DYNO || "local",
    hasMongo: Boolean(process.env.MONGODB_URI),
    hasCloudinary: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
  });

  await connectDB();

  const serveFrontend =
    process.env.NODE_ENV === "production" ||
    process.env.SERVE_FRONTEND === "true";

  if (serveFrontend) {
    await attachNext();
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Adonis running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start Adonis:", err);
  process.exit(1);
});
