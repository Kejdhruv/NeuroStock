const { MongoClient } = require("mongodb");

const database = 'STOCKDATA';
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function SoldingFunds(FundsSold) {
    try {
        if (!Array.isArray(FundsSold)) {
            throw new Error("Input must be an array");
        }
        await client.connect();
      
        const db = client.db(database);
        const collection = db.collection('SoldFunds');

        const result = await collection.insertMany(FundsSold);
        return result;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    } finally {
    
        await client.close();
    }
}

module.exports = SoldingFunds;