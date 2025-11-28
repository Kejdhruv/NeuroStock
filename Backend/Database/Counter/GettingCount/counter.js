const { MongoClient, ObjectId } = require('mongodb');

const database = 'STOCKDATA';
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function BuyingCounter() {
    try {
        
        await client.connect();
       
        const db = client.db(database);
        const collection = db.collection('Counter');

        const data = await collection.find({ _id: "buyingId" }).toArray();

        return data;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = BuyingCounter;