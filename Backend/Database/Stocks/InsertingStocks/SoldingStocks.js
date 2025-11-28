const { MongoClient } = require("mongodb");

const database = 'STOCKDATA';
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function SoldingStocks(StockSold) {
    try {
        if (!Array.isArray(StockSold)) {
            throw new Error("Input must be an array");
        }
        await client.connect();
      
        const db = client.db(database);
        const collection = db.collection('SoldStocks');

        const result = await collection.insertMany(StockSold);
        return result;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    } finally {
    
        await client.close();
    }
}

module.exports = SoldingStocks;