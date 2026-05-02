const { getDb } = require("../db.js");

async function CreateUser(User) {
    try {
        if (!Array.isArray(User)) {
            throw new Error("Input must be an array");
        }
        const db = await getDb();
        const collection = db.collection('Users');

        const result = await collection.insertMany(User);
        return result;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = CreateUser;
