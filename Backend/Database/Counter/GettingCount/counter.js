const { getDb } = require("../../db.js");

async function BuyingCounter() {
    try {
        
        const db = await getDb();
        const collection = db.collection('Counter');

        const data = await collection.find({ _id: "buyingId" }).toArray();

        return data;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = BuyingCounter;
