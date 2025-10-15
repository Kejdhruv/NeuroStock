const { MongoClient, ObjectId } = require('mongodb');

const database = 'STOCKDATA';
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function dbConnect12(_id) {
    try {
        
        await client.connect();
       
        const db = client.db(database);
        const collection = db.collection('Holdings');

        const data = await collection.find({ _id: new ObjectId(_id) }).toArray();

        return data;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = dbConnect12;