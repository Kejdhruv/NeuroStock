const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const databaseName = process.env.MONGODB_DB_NAME || "STOCKDATA";
const mongoUri = process.env.MONGODB_URI;

let client;
let db;
let connectionPromise;

async function connectToDatabase() {
  if (db) {
    return db;
  }

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to Backend/.env");
  }

  if (!client) {
    client = new MongoClient(mongoUri);
  }

  if (!connectionPromise) {
    connectionPromise = client.connect();
  }

  await connectionPromise;
  db = client.db(databaseName);
  return db;
}

async function getDb() {
  return connectToDatabase();
}

async function closeDatabase() {
  if (client) {
    await client.close();
  }

  client = undefined;
  db = undefined;
  connectionPromise = undefined;
}

module.exports = {
  connectToDatabase,
  getDb,
  closeDatabase,
};
