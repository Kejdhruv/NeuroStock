const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'STOCKDATA';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function dbConnect11(counterId, value) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('Counter');

    const result = await collection.updateOne(
      { _id: counterId },          // ✅ Match by _id field
      { $set: { value: value } }   // ✅ Update value field
    );

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    };
  } catch (err) {
    console.error("Error updating counter:", err);
    throw err;
  } finally {
    await client.close();
  }
}

module.exports = dbConnect11;