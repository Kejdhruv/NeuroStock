const { getDb } = require("../../db.js");

async function SoldingStocks(StockSold) {
    try {
        if (!Array.isArray(StockSold)) {
            throw new Error("Input must be an array");
        }
        const db = await getDb();
        const collection = db.collection('SoldStocks');

        const result = await collection.insertMany(StockSold);
        return result;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = SoldingStocks;
