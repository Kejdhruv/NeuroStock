const { MongoClient, ObjectId } = require('mongodb');

const database = 'STOCKDATA';
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function dbConnect2() {
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

module.exports = dbConnect2;