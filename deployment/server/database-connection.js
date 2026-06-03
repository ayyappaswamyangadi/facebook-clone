require("dotenv").config();
const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

async function databaseConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("connected to db");
  } catch (err) {
    console.log("Database connection error:", err.message);
  }
}

module.exports = databaseConnection;
