require("dotenv").config();

const { MongoClient } = require("mongodb");
const mongoUrl = process.env.MONGO_URL;
const client = new MongoClient(mongoUrl);

async function dbConnect() {
  let result = await client.connect();
  let db = result.db("facebook-users");
  return db.collection("users");
}

module.exports = dbConnect;
