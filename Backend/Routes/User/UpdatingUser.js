import express from "express";
import { authMiddleware } from "../../Middleware/DecodeToken.js";  
import DeletingHoldings from "../../Database/Stocks/UpdatingStocks/DeletingHoldings.js";
import DeletingFundHoldings from "../../Database/MutualFunds/UpdatingFunds/DeletingFundHoldings.js";
import UpdatingHoldings from "../../Database/Stocks/UpdatingStocks/UpdatingHoldings.js";
import UpdatingFunds from "../../Database/MutualFunds/UpdatingFunds/DeletingFundHoldings.js";
const router = express.Router();  


//Deleting Hodings 

router.delete('/Holdings/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
      const result = await DeletingHoldings(_id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).send('Internal Server Error');
  }
});  

router.delete('/MutualHoldings/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const result = await DeletingFundHoldings(_id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Error deleting item:', err);
    res.status(500).send('Internal Server Error');
  }
}); 

//Updating Holdindgs 

router.put('/Holdings/:_id', async (req, res) => {
  const { Quantity } = req.body;
  const { _id } = req.params;

  if (typeof Quantity !== 'number') {
    return res.status(400).json({ message: 'Quantity must be a number' });
  }

  try {
    const result = await UpdatingHoldings(_id, Quantity);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Holding not found' });
    }

    res.status(200).json({
      message: 'Quantity updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error updating holding:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}); 



router.put('/MutualHoldings/:_id', async (req, res) => {
  const { Quantity } = req.body;
  const { _id } = req.params;

  if (typeof Quantity !== 'number') {
    return res.status(400).json({ message: 'Quantity must be a number' });
  }

  try {
    const result = await UpdatingFunds(_id, Quantity);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Holding not found' });
    }

    res.status(200).json({
      message: 'Quantity updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error updating holding:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}); 


export default router; 