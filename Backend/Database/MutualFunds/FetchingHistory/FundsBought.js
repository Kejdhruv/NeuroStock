const { getDb } = require("../../db.js");

async function FundsBought(Userid) {
    try {
        
        const db = await getDb();
        const collection = db.collection('FundsBought');

        const data = await collection.find({Userid}).toArray();

        return data;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = FundsBought; 
