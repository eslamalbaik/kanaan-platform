const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const User = require("./models/user.model");

async function createAdmin() {
  await mongoose.connect(process.env.DATABAZE_URL);

  const existing = await User.findOne({ email: "admin@kanaan.com" });
  if (existing) {
    console.log("Admin already exists!");
    process.exit(0);
  }

  const admin = new User({
    name: "Admin",
    email: "admin@kanaan.com",
    password: "Admin@1234",
    phone: "+970599123456",
    role: "admin",
  });

  await admin.save();
  console.log("Admin created successfully!");
  console.log("Email: admin@kanaan.com");
  console.log("Password: Admin@1234");
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
