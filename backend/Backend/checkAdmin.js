const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const User = require("./models/user.model");

async function check() {
  await mongoose.connect(process.env.DATABAZE_URL);
  const users = await User.find({}).select("+password +role");
  console.log("Users in DB:", users.length);
  users.forEach(u => console.log("- Email:", u.email, "| Role:", u.role));
  process.exit(0);
}

check().catch(console.error);
