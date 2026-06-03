require("dotenv").config();
const mongoose = require("mongoose");

async function databaseConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("Database connection error:", err.message);
    process.exit(1);
  }
}

module.exports = databaseConnection;
