import express from "express";
import { authMiddleware } from "../../Middleware/DecodeToken.js"; 
import HoldingsByuser from "../../Database/Stocks/FetchingHistory/HoldingsByuser.js";
import SoldStocksByUser from "../../Database/Stocks/FetchingHistory/SoldStocks.js";
import BoughtByUser from "../../Database/Stocks/FetchingHistory/Boughts.js";
import FundsBought from "../../Database/MutualFunds/FetchingHistory/FundsBought.js";
import SoldFunds from "../../Database/MutualFunds/FetchingHistory/SoldFunds.js";
import FundsHoldings from "../../Database/MutualFunds/FetchingHistory/FundsHoldings.js";

const router = express.Router(); 
// Getting All The User Holdings , Boughts , Solds 
router.get('/Profile/Holdings',authMiddleware, async (req, res) => {
  try {
     const { UserId } = req.user; 
    const data = await HoldingsByuser(UserId);
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch claims for user" });
  }
}); 

router.get('/Profile/SoldStocks',authMiddleware, async (req, res) => {
   try {
     const { UserId } = req.user; 
    const data = await SoldStocksByUser(UserId);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch sold stocks" });
  }
}) 
 
router.get('/Profile/Boughts',authMiddleware, async (req, res) => {
   try {
     const { UserId } = req.user; 
    const data = await BoughtByUser(UserId);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch sold stocks" });
  }
})  

router.get('/Profile/FundsBoughts',authMiddleware, async (req, res) => {
   try {
      const { UserId } = req.user; 
    const data = await FundsBought(UserId);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch sold stocks" });
  } 
})  

router.get('/Profile/SoldFunds',authMiddleware, async (req, res) => {
   try {
    const { UserId } = req.user; 
    const data = await SoldFunds(UserId);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch sold stocks" });
  }
}) 

router.get('/Profile/FundsHoldings',authMiddleware, async (req, res) => {
  try {
     const { UserId } = req.user; 
    const data = await FundsHoldings(UserId);
    res.send(data); 
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch Holdings" });
  }
}) 

export default router;