const dns = require("dns");
const mongoose = require("mongoose");

// Only override DNS on local networks that block MongoDB SRV.
// On Heroku (DYNO is set), use the platform DNS or Mongo will fail to connect.
if (!process.env.DYNO && process.env.DNS_OVERRIDE !== "false") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing from environment variables");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
  });
  console.log("MongoDB connected");
}

module.exports = connectDB;
