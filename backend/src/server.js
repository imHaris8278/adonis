require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Adonis API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
