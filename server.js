const path = require("path");
const fs = require("fs");

// Heroku injects config vars into process.env — no dotenv needed in production.
// For local combined runs, optionally load backend/.env if present.
const envPath = path.join(__dirname, "backend", ".env");
if (!process.env.DYNO && fs.existsSync(envPath)) {
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const key = trimmed.slice(0, i).trim();
    let val = trimmed.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

const connectDB = require("./backend/src/config/db");
const app = require("./backend/src/app");

const PORT = process.env.PORT || 3000;

let nextHandle = null;
let booting = true;
let bootError = null;

// Bind PORT first (Heroku 60s boot limit), then warm Mongo + Next.
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  if (bootError) {
    return res
      .status(503)
      .type("html")
      .send(`<pre>Adonis failed to start:\n${bootError}</pre>`);
  }
  if (booting || !nextHandle) {
    return res
      .status(503)
      .type("html")
      .send("<pre>Adonis is starting… refresh in a few seconds.</pre>");
  }
  return nextHandle(req, res);
});

async function attachNext() {
  const frontendDir = path.join(__dirname, "frontend");
  const nextDir = path.join(frontendDir, ".next");
  const nextPkg = path.join(frontendDir, "node_modules", "next");

  if (!fs.existsSync(nextPkg)) {
    throw new Error(`Next.js not found at ${nextPkg}`);
  }
  if (!fs.existsSync(nextDir)) {
    throw new Error(`Next build missing at ${nextDir}`);
  }

  const next = require(nextPkg);
  const nextApp = next({
    dev: false,
    dir: frontendDir,
  });
  await nextApp.prepare();
  nextHandle = nextApp.getRequestHandler();
  console.log("Next.js frontend ready");
}

async function warmUp() {
  console.log("Warming up Adonis...", {
    node: process.version,
    dyno: process.env.DYNO || "local",
    hasMongo: Boolean(process.env.MONGODB_URI),
  });

  await connectDB();

  const serveFrontend =
    process.env.NODE_ENV === "production" ||
    process.env.SERVE_FRONTEND === "true";

  if (serveFrontend) {
    await attachNext();
  }

  booting = false;
  console.log("Adonis ready");
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Adonis listening on port ${PORT}`);
  warmUp().catch((err) => {
    console.error("Warm-up failed:", err);
    bootError = err && err.stack ? err.stack : String(err);
    booting = false;
  });
});
