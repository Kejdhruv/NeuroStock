const { getDb } = require("../../db.js");

async function PostingHoldings(holding) {
    try {
        if (!Array.isArray(holding)) {
            throw new Error("Input must be an array");
        }
        const db = await getDb();
        const collection = db.collection('Holdings');

        const result = await collection.insertMany(holding);
        return result;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = PostingHoldings;
