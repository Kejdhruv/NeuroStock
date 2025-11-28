const { MongoClient } = require("mongodb");

const database = 'STOCKDATA';
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function SoldStocksByUser(Userid) {
    try {
        
        await client.connect();
       
        const db = client.db(database);
        const collection = db.collection('SoldStocks');

        const data = await collection.find({Userid}).toArray();

        return data;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = SoldStocksByUser; 