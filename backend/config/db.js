const mongoose = require("mongoose");

async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("MongoDB URI not set yet. Skipping database connection for now.");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;