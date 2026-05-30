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
       subject: `Purchase Confirmation · ${stock.Stocksymbol || stock.Stockname} — NeuroStock`,
htmlContent: `
<div style="background:#f1f5f9;padding:48px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:620px;margin:auto;">

    <!-- Brand -->
    <div style="text-align:center;margin-bottom:28px;">
      <span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:#0f172a;letter-spacing:-.3px;">
        NeuroStock
      </span>
    </div>

    <!-- Card -->
    <div style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;">

      <!-- Header -->
      <div style="padding:36px 40px 28px;border-bottom:1px solid #f1f5f9;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:4px 10px;margin-bottom:14px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#16a34a" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/></svg>
              <span style="font-size:12px;font-weight:500;color:#15803d;letter-spacing:.3px;text-transform:uppercase;">Order Confirmed</span>
            </div>
            <h1 style="margin:0;font-size:24px;font-weight:600;color:#0f172a;line-height:1.3;letter-spacing:-.4px;">Your order has been<br>executed successfully.</h1>
            <p style="margin:10px 0 0;font-size:14px;color:#64748b;line-height:1.6;">Your shares have been purchased at market price and added to your portfolio. A full record of this transaction has been logged to your account.</p>
          </div>
          <div style="flex-shrink:0;width:64px;height:64px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;overflow:hidden;">
            <img src="${stock.stockimage || ''}" alt="${stock.Stockname}" style="width:44px;height:44px;object-fit:contain;" />
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div style="padding:24px 40px;background:#fafafa;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div>
          <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:.5px;">Stock</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:600;color:#0f172a;letter-spacing:-.3px;">${stock.Stockname || 'N/A'}</p>
          <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${stock.Stocksymbol} · Market Order</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:.5px;">Total Invested</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:600;color:#0f172a;letter-spacing:-.5px;">$${(stock.Boughtat * stock.Quantity).toFixed(2)}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#16a34a;font-weight:500;">Funds settled</p>
        </div>
      </div>

      <!-- Details table -->
      <div style="padding:28px 40px;">
        <p style="margin:0 0 16px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;">Transaction Details</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Shares Purchased</td>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;font-weight:500;color:#0f172a;">${stock.Quantity} shares</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Price per Share</td>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;font-weight:500;color:#0f172a;">$${stock.Boughtat}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Wallet Used</td>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;color:#64748b;font-family:monospace;">${stock.accountid}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Transaction ID</td>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:12px;color:#64748b;font-family:monospace;">${stock.Transactionid}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;font-size:13px;color:#64748b;">Executed At</td>
            <td style="padding:11px 0;text-align:right;font-size:13px;color:#64748b;">${new Date(stock.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
          </tr>
        </table>
      </div>

      <!-- Portfolio note -->
      <div style="margin:0 40px 28px;background:#f8fafc;border-radius:12px;padding:18px 20px;display:flex;align-items:flex-start;gap:12px;border:1px solid #e2e8f0;">
        <div>
          <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">Portfolio updated</p>
          <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">Your holdings dashboard now reflects this purchase. Track real-time performance, set price alerts, and review your cost basis directly from your NeuroStock account.</p>
        </div>
      </div>

      <!-- CTA -->
      <div style="padding:0 40px 36px;text-align:center;">
        <a href="https://neuro-stock.vercel.app" style="display:inline-flex;align-items:center;gap:7px;background:#0f172a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:500;">
          View in Portfolio &rarr;
        </a>
        <p style="margin:14px 0 0;font-size:12px;color:#94a3b8;">Questions? Visit <a href="#" style="color:#64748b;text-decoration:underline;">support.neurostock.com</a></p>
      </div>

    </div>

    <!-- Footer -->
    <div style="padding:24px 0 8px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.8;">
        NeuroStock Technologies · Smart Investing. Secure Trading.<br>
        <a href="#" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a> · 
        <a href="#" style="color:#94a3b8;text-decoration:underline;">Privacy Policy</a> · 
        <a href="#" style="color:#94a3b8;text-decoration:underline;">Terms</a>
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;">© 2026 NeuroStock. All rights reserved.</p>
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

    StockSold.forEach(item => {
      item.Userid = Userid;
      item.Email = Email;
    });

    const result = await SoldingStocks(StockSold);

    // ── Send sell confirmation email ──────────────────────────────
    try {
      const stock = StockSold[0];
      const proceeds = (stock.Soldat * stock.Quantity).toFixed(2);

      // Truncate long tx hash for display
      const shortTxId = stock.Transactionid?.length > 20
        ? `${stock.Transactionid.slice(0, 10)}...${stock.Transactionid.slice(-5)}`
        : stock.Transactionid;

      await emailApi.sendTransacEmail({
        sender: {
          email: "nneurostock@gmail.com",
          name: "NeuroStock",
        },
        to: [{ email: Email }],
        subject: `Sale Confirmation · ${stock.Stocksymbol || stock.Stockname} — NeuroStock`,
        htmlContent: `
<div style="background:#f1f5f9;padding:48px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:620px;margin:auto;">

    <!-- Brand -->
    <div style="text-align:center;margin-bottom:28px;">
      <span style="display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:#0f172a;letter-spacing:-.3px;">
        NeuroStock
      </span>
    </div>

    <!-- Card -->
    <div style="background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;">

      <!-- Header -->
      <div style="padding:36px 40px 28px;border-bottom:1px solid #f1f5f9;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;padding:4px 10px;margin-bottom:14px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ea580c" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/></svg>
              <span style="font-size:12px;font-weight:500;color:#c2410c;letter-spacing:.3px;text-transform:uppercase;">Sale Executed</span>
            </div>
            <h1 style="margin:0;font-size:24px;font-weight:600;color:#0f172a;line-height:1.3;letter-spacing:-.4px;">Your shares have been<br>sold successfully.</h1>
            <p style="margin:10px 0 0;font-size:14px;color:#64748b;line-height:1.6;">Your position has been closed and proceeds are being processed to your wallet. A full record of this transaction has been logged to your account.</p>
          </div>
          <div style="flex-shrink:0;width:64px;height:64px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;overflow:hidden;">
            <img src="${stock.stockimage || ''}" alt="${stock.Stockname}" style="width:44px;height:44px;object-fit:contain;" />
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div style="padding:24px 40px;background:#fafafa;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div>
          <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:.5px;">Stock Sold</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:600;color:#0f172a;letter-spacing:-.3px;">${stock.Stockname || 'N/A'}</p>
          <p style="margin:2px 0 0;font-size:13px;color:#64748b;">${stock.Stocksymbol} · Market Order</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:500;text-transform:uppercase;letter-spacing:.5px;">Proceeds</p>
          <p style="margin:4px 0 0;font-size:24px;font-weight:600;color:#0f172a;letter-spacing:-.5px;">$${proceeds}</p>
          <p style="margin:2px 0 0;font-size:12px;color:#94a3b8;font-weight:500;">Processing to wallet</p>
        </div>
      </div>

      <!-- Details table -->
      <div style="padding:28px 40px;">
        <p style="margin:0 0 16px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;">Transaction Details</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Shares Sold</td>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;font-weight:500;color:#0f172a;">${stock.Quantity} ${stock.Quantity === 1 ? 'share' : 'shares'}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Sale Price per Share</td>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;font-weight:500;color:#0f172a;">$${stock.Soldat}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Destination Wallet</td>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;color:#64748b;font-family:monospace;">${stock.accountid || '—'}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Transaction ID</td>
            <td style="padding:11px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:11px;color:#64748b;font-family:monospace;">${shortTxId}</td>
          </tr>
          <tr>
            <td style="padding:11px 0;font-size:13px;color:#64748b;">Executed At</td>
            <td style="padding:11px 0;text-align:right;font-size:13px;color:#64748b;">${new Date(stock.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
          </tr>
        </table>
      </div>

      <!-- Portfolio note -->
      <div style="margin:0 40px 28px;background:#f8fafc;border-radius:12px;padding:18px 20px;display:flex;align-items:flex-start;gap:12px;border:1px solid #e2e8f0;">
        <div style="width:34px;height:34px;border-radius:9px;background:#0f172a;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
        </div>
        <div>
          <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">Position closed</p>
          <p style="margin:4px 0 0;font-size:13px;color:#64748b;line-height:1.5;">This holding has been removed from your portfolio. Proceeds will reflect in your wallet balance shortly. View your full transaction history and remaining positions from your NeuroStock dashboard.</p>
        </div>
      </div>

      <!-- CTA -->
      <div style="padding:0 40px 36px;text-align:center;">
        <a href="https://neuro-stock.vercel.app" style="display:inline-flex;align-items:center;gap:7px;background:#0f172a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:500;letter-spacing:-.1px;">
          View Dashboard &rarr;
        </a>
        <p style="margin:14px 0 0;font-size:12px;color:#94a3b8;">Questions? Visit <a href="#" style="color:#64748b;text-decoration:underline;">support.neurostock.com</a></p>
      </div>

    </div>

    <!-- Footer -->
    <div style="padding:24px 0 8px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.8;">
        NeuroStock Technologies · Smart Investing. Secure Trading.<br>
        <a href="#" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a> · 
        <a href="#" style="color:#94a3b8;text-decoration:underline;">Privacy Policy</a> · 
        <a href="#" style="color:#94a3b8;text-decoration:underline;">Terms</a>
      </p>
      <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;">© 2026 NeuroStock. All rights reserved.</p>
    </div>

  </div>
</div>
`
      });

      console.log("Sale email sent to:", Email);
    } catch (mailErr) {
      console.error("Sale email failed:", mailErr);
    }
    // ─────────────────────────────────────────────────────────────

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