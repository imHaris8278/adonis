require("dotenv").config({ path: require("path").join(__dirname, "backend", ".env") });

const path = require("path");
const connectDB = require("./backend/src/config/db");
const app = require("./backend/src/app");

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();

  const serveFrontend =
    process.env.NODE_ENV === "production" ||
    process.env.SERVE_FRONTEND === "true";

  if (serveFrontend) {
    const next = require(path.join(__dirname, "frontend", "node_modules", "next"));
    const nextApp = next({
      dev: false,
      dir: path.join(__dirname, "frontend"),
    });
    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();

    // API is already on /api/* — hand everything else to Next.js
    app.use((req, res) => handle(req, res));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Adonis running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start Adonis:", err);
  process.exit(1);
});
