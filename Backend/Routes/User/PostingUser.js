import express from "express";
import { authMiddleware } from "../../Middleware/DecodeToken.js";  
import PostingHoldings from "../../Database/Stocks/InsertingStocks/PostingHoldings.js";
import BuyingStock from "../../Database/Stocks/InsertingStocks/Buying.js";
import SoldingStocks from "../../Database/Stocks/InsertingStocks/SoldingStocks.js";
import PostingFundsHoldings from "../../Database/MutualFunds/InsertingFunds/PostingFundHoldings.js";
import FundsBuying from "../../Database/MutualFunds/InsertingFunds/FundsBuying.js";
import SoldingFunds from "../../Database/MutualFunds/InsertingFunds/SoldingFunds.js";

const router = express.Router();  
// Posting Stocks 
router.post("/Holdings", authMiddleware, async (req, res) => {
  try {
   const { Userid, Email } = req.user;  


    const bodyData = req.body;
    const holding = Array.isArray(bodyData) ? bodyData : [bodyData];
    holding.forEach(item => {
      item.Userid = Userid;
        item.Email = Email;
           item.BoughtAt = new Date().toISOString();
    });

    // Perform DB inserts
    const result = await PostingHoldings(holding);
    const result2 = await BuyingStock(holding); 

    res.status(201).json({
      message: "Stocks added successfully",
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds,
      purchaseResult: {
        success: result2?.success ?? true
      }
    });

  } catch (err) {
    console.error("❌ Error adding holdings:", err);
    res.status(500).json({ error: "Internal server error while adding holdings" });
  }
}); 


router.post("/StocksSold", authMiddleware, async (req, res) => {
  try {
    const { Userid, Email } = req.user;  

    const bodyData = req.body;
    const StockSold = Array.isArray(bodyData) ? bodyData : [bodyData];

    // Append user details to each sold stock object
    StockSold.forEach(item => {
      item.Userid = Userid;
      item.Email = Email;
      item.soldAt = new Date().toISOString();
    });

    const result = await SoldingStocks(StockSold);

    res.status(201).json({
      message: "Stock sold successfully",
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds
    });

  } catch (err) {
    console.error("❌ Error selling stock:", err);
    res.status(500).json({ error: "Internal Server Error while selling stock" });
  }
});


//Posting Funds 

router.post("/FundsHoldings", authMiddleware, async (req, res) => {
  try {
     const { Userid, Email } = req.user;  

    const bodyData = req.body;
    const holding = Array.isArray(bodyData) ? bodyData : [bodyData];

    // Append user details to each funds holding entry
    holding.forEach(item => {
      item.Userid = Userid;
      item.Email = Email;
      item.addedAt = new Date().toISOString();
    });

      const result = await PostingFundsHoldings(holding);
      const result2 = await FundsBuying(holding);
      

    res.status(201).json({
      message: "Funds holdings added successfully",
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds
    });

  } catch (err) {
    console.error("❌ Error adding funds holdings:", err);
    res.status(500).json({ error: "Internal Server Error while adding funds holdings" });
  }
}); 

router.post("/SoldFunds", authMiddleware, async (req, res) => {
  try {
     const { Userid, Email } = req.user;  

    const bodyData = req.body;
    const holding = Array.isArray(bodyData) ? bodyData : [bodyData];

    // Append user details to each funds holding entry
    holding.forEach(item => {
      item.Userid = Userid;
      item.Email = Email;
      item.addedAt = new Date().toISOString();
    });

      const result = await SoldingFunds(holding);
      

    res.status(201).json({
      message: "Funds holdings added successfully",
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds
    });

  } catch (err) {
    console.error("❌ Error adding funds holdings:", err);
    res.status(500).json({ error: "Internal Server Error while adding funds holdings" });
  }
}); 





export default router;