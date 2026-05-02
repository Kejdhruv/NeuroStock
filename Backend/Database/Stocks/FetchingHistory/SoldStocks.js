const { getDb } = require("../../db.js");

async function SoldStocksByUser(Userid) {
    try {
        
        const db = await getDb();
        const collection = db.collection('SoldStocks');

        const data = await collection.find({Userid}).toArray();

        return data;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = SoldStocksByUser; 
