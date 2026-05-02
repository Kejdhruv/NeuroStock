const { ObjectId } = require('mongodb');
const { getDb } = require("../../db.js");


async function dbConnect12(_id) {
    try {
        const db = await getDb();
        const collection = db.collection('Holdings');

        const data = await collection.find({ _id: new ObjectId(_id) }).toArray();

        return data;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err; 
    }
}

module.exports = dbConnect12;
