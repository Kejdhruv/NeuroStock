const { ObjectId } = require('mongodb');
const { getDb } = require("../../db.js");

async function DeletingHoldings(_id) {
    try {
        const db = await getDb();
        const collection = db.collection('Holdings'); 

    
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
    }
}

module.exports = DeletingHoldings;
