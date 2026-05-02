const { getDb } = require("../../db.js");

async function BuyingStock(boughts) {
    try {
        if (!Array.isArray(boughts)) {
            throw new Error("Input must be an array");
        }
        const db = await getDb();
        const collection = db.collection('StockBought');

        const result = await collection.insertMany(boughts);
        return result;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = BuyingStock;
