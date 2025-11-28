const { MongoClient } = require("mongodb");

const database = 'STOCKDATA';
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function CreateUser(User) {
    try {
        if (!Array.isArray(User)) {
            throw new Error("Input must be an array");
        }
        await client.connect();
      
        const db = client.db(database);
        const collection = db.collection('Users');

        const result = await collection.insertMany(User);
        return result;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    } finally {
    
        await client.close();
    }
}

module.exports = CreateUser;