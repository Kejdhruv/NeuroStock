const { MongoClient } = require("mongodb");

const database = 'STOCKDATA';
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function FundsHoldings(Userid) {
    try {
        
        await client.connect();
       
        const db = client.db(database);
        const collection = db.collection('FundsHoldings');

        const data = await collection.find({Userid}).toArray();

        return data;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = FundsHoldings; 