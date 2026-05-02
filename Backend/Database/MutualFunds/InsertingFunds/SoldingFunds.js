const { getDb } = require("../../db.js");

async function SoldingFunds(FundsSold) {
    try {
        if (!Array.isArray(FundsSold)) {
            throw new Error("Input must be an array");
        }
        const db = await getDb();
        const collection = db.collection('SoldFunds');

        const result = await collection.insertMany(FundsSold);
        return result;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = SoldingFunds;
