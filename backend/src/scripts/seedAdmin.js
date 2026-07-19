require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

async function seedAdmin() {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@wasi.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123456";
  const name = process.env.ADMIN_NAME || "Admin";

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    existing.role = "admin";
    if (process.env.RESET_ADMIN_PASSWORD === "true") {
      existing.password = password;
    }
    await existing.save();
    console.log(`Admin ready: ${existing.email}`);
  } else {
    await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "admin",
    });
    console.log(`Admin created: ${email}`);
  }

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
