import express from "express";
import { authMiddleware } from "../../Middleware/DecodeToken.js";  
import PostingHoldings from "../../Database/Stocks/InsertingStocks/PostingHoldings.js";
import BuyingStock from "../../Database/Stocks/InsertingStocks/Buying.js";
import SoldingStocks from "../../Database/Stocks/InsertingStocks/SoldingStocks.js";
import PostingFundsHoldings from "../../Database/MutualFunds/InsertingFunds/PostingFundHoldings.js";
import FundsBuying from "../../Database/MutualFunds/InsertingFunds/FundsBuying.js";
import SoldingFunds from "../../Database/MutualFunds/InsertingFunds/SoldingFunds.js";

import SibApiV3Sdk from "sib-api-v3-sdk";

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_BUY_API_KEY;
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

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
    });

    // Perform DB inserts
    const result = await PostingHoldings(holding);
    const result2 = await BuyingStock(holding); 

    try {
      const stock = holding[0];

      await emailApi.sendTransacEmail({
        sender: {
          email: "nneurostock@gmail.com",
          name: "NeuroStock",
        },
        to: [
          {
            email: Email,
          },
        ],
        subject: `📈 Purchase Confirmation • ${stock.Stocksymbol || stock.Stockname}`,
        htmlContent: `
<div style="background:linear-gradient(135deg,#f8fafc,#eef2ff);padding:60px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <div style="max-width:650px;margin:auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,.08);">

    <div style="background:linear-gradient(135deg,#10b981,#22c55e);padding:42px;text-align:center;">
      <h1 style="margin:0;color:white;font-size:32px;">Purchase Successful 🎉</h1>
      <p style="color:rgba(255,255,255,.92);margin-top:10px;">Your investment has been added to your NeuroStock portfolio.</p>
    </div>

    <div style="padding:40px;">

      <div style="text-align:center;margin-bottom:24px;">
        <img src="${stock.stockimage || ''}" alt="Stock" style="width:72px;height:72px;border-radius:16px;object-fit:contain;background:#fff;border:1px solid #e5e7eb;padding:8px;" />
      </div>

      <h2 style="color:#111827;margin-top:0;">${stock.Stockname || 'Stock Purchase'}</h2>

      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:24px;">
        <p><strong>Symbol:</strong> ${stock.Stocksymbol}</p>
        <p><strong>Quantity:</strong> ${stock.Quantity}</p>
        <p><strong>Purchase Price:</strong> $${stock.Boughtat}</p>
        <p><strong>Transaction ID:</strong> ${stock.Transactionid}</p>
        <p><strong>Wallet:</strong> ${stock.accountid}</p>
        <p><strong>Date:</strong> ${new Date(stock.timestamp).toLocaleString()}</p>
      </div>

      <div style="margin-top:28px;padding:20px;background:#ecfdf5;border-radius:14px;border:1px solid #bbf7d0;">
        <strong style="color:#166534;">Portfolio Updated Successfully</strong>
        <p style="margin-top:8px;color:#166534;">This stock is now reflected in your holdings dashboard.</p>
      </div>

    </div>

    <div style="border-top:1px solid #e5e7eb;padding:22px;text-align:center;color:#64748b;font-size:13px;">
      © 2026 NeuroStock • Smart Investing. Secure Trading.
    </div>

  </div>

</div>
`
      });

      console.log("Purchase email sent to:", Email);
    } catch (mailErr) {
      console.error("Purchase email failed:", mailErr);
    }

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