const dns = require("dns");
const mongoose = require("mongoose");

// Some local routers refuse MongoDB SRV lookups; fall back to public DNS.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing from environment variables");
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

module.exports = connectDB;
