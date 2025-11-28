import express from "express"; 
import dotenv from "dotenv"; 
import BuyingCounter from "../../Database/Counter/GettingCount/counter.js";
import SellingCounter from "../../Database/Counter/GettingCount/counter2.js";
import UpdatingsellingCounter from "../../Database/Counter/UpdatingCount/CounterUpdate2.js";
import UpdatingBuyingCounter from "../../Database/Counter/UpdatingCount/CounterUpdate2.js";
dotenv.config();
const router = express.Router();

//Getting Counter 
router.get('/Counter/buyingId', async (req, res) => {
  try {
    const data = await BuyingCounter(); 
    res.send(data);
  } catch (err) {
   console.error(err);
    res.status(500).send({ error: "Failed to fetch the Count" });
  }
}); 

router.get('/Counter/sellingId', async (req, res) => {
  try {
   const data = await SellingCounter();
    res.send(data);
  } catch (err) {
   console.error(err);
    res.status(500).send({ error: "Failed to fetch the Count" });
  }
}); 

//Updating Counter 

router.put('/Counter/buyingId', async (req, res) => {
  const { value } = req.body;

  if (typeof value !== 'number') {
    return res.status(400).json({ message: 'Value must be a number' });
  }

  try {
    const result = await UpdatingBuyingCounter("buyingId", value); // Fixed use of ID

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Counter not found' });
    }

    res.status(200).json({
      message: 'Counter updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error updating counter:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}); 


router.put('/Counter/sellingId', async (req, res) => {
  const { value } = req.body;

  if (typeof value !== 'number') {
    return res.status(400).json({ message: 'Value must be a number' });
  }

  try {
    const result = await UpdatingsellingCounter("sellingId", value); // Fixed use of ID

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Counter not found' });
    }

    res.status(200).json({
      message: 'Counter updated successfully',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Error updating counter:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}); 



export default router; 