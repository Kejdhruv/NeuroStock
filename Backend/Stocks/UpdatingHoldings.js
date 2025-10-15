const { MongoClient, ObjectId } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'STOCKDATA';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function dbConnect13(_id, value) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('Holdings');

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },             // ✅ Convert _id to ObjectId
      { $set: { Quantity: value } }           // ✅ Update Quantity field
    );

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    };
  } catch (err) {
    console.error("Error updating counter:", err);
    throw err;
  } finally {
    await client.close();  // ✅ Always close the client
  }
}

module.exports = dbConnect13;