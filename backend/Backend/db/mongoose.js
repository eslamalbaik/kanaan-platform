const mongoose = require("mongoose");

mongoose.set("bufferCommands", true);

mongoose.connect(process.env.DATABAZE_URL)
  .then(() => console.log("✅ Connected to MongoDB successfully!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection lost:", err);
});
