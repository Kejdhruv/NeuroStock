const { MongoClient, ObjectId } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'STOCKDATA'; 
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function dbConnect21(_id) {
    try {
        await client.connect(); 

        const db = client.db(dbName);
        const collection = db.collection('GoldHoldings'); 

    
        const result = await collection.deleteOne({ _id: new ObjectId(_id) });

        if (result.deletedCount === 1) {
            console.log(`Successfully deleted item with id ${_id}`);
            return { success: true, message: `Deleted item with id ${_id}` };
        } else {
            console.log(`No item found with id ${_id}`);
            return { success: false, message: `No item found with id ${_id}` };
        }
    } catch (err) {
        console.error("Error deleting item:", err);
        throw err;
    } finally {
        await client.close(); 
    }
}

module.exports = dbConnect21;