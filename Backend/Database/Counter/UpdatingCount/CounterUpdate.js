const { getDb } = require("../../db.js");

async function UpdatingBuyingCounter(counterId, value) {
  try {
    const db = await getDb();
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
  }
}

module.exports = UpdatingBuyingCounter;
