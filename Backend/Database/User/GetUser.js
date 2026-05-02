const { getDb } = require("../db.js");

async function GetUser(email) {
    try {
        const db = await getDb();
        const collection = db.collection('Users');
        const user = await collection.findOne({ email });
        return user; 
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    }
}

module.exports = GetUser;
