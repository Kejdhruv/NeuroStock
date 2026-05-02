const { ObjectId } = require('mongodb');
const { getDb } = require("../../db.js");

async function UpdatingHoldings(_id, value) {
  try {
    const db = await getDb();
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
  }
}

module.exports = UpdatingHoldings;
