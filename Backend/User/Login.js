const { MongoClient } = require("mongodb");

const url = 'mongodb://localhost:27017';
const database = 'STOCKDATA';
const client = new MongoClient(url);

async function dbConnect10(email) {
    try {
        await client.connect();
        const db = client.db(database);
        const collection = db.collection('Users');

        // Find single user with the provided email
        const user = await collection.findOne({ email });

        return user; // return single user (or null if not found)
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    }
}

module.exports = dbConnect10;