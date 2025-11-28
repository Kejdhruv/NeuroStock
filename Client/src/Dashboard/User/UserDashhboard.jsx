import React, { useEffect, useState } from "react";
import "./UserDashhboard.css";
import { FaChartLine, FaWallet, FaShoppingCart, FaMoneyBillWave } from "react-icons/fa";

const API_HOLD = "http://localhost:3001/Profile/Holdings";
const API_BUY  = "http://localhost:3001/Profile/Boughts";
const API_SELL = "http://localhost:3001/Profile/SoldStocks";

const UserDashboard = () => {
  const [holdings, setHoldings] = useState([]);
  const [boughts, setBoughts] = useState([]);
  const [solds, setSolds] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [holdRes, buyRes, sellRes] = await Promise.all([
          fetch(API_HOLD, { credentials: "include" }),
          fetch(API_BUY,  { credentials: "include" }),
          fetch(API_SELL, { credentials: "include" })
        ]);

        const holdData = await holdRes.json();
        const buyDataRaw = await buyRes.json();
        const sellDataRaw = await sellRes.json();

        // ✅ Ensure arrays, else fallback safely
        const h = Array.isArray(holdData) ? holdData : [];
        const b = Array.isArray(buyDataRaw) ? buyDataRaw : [];
        const s = Array.isArray(sellDataRaw) ? sellDataRaw : [];

        // ✅ Set correct states (no renamed keys so UI stays same)
        setHoldings(h);
        setBoughts(b);
        setSolds(s);

        // ✅ Merge & sort recent activity safely using correct key
        const allActivity = [
          ...b.map(i => ({ ...i, type: "BOUGHT", timestamp: i.timestamp })),
          ...s.map(i => ({ ...i, type: "SOLD", timestamp: i.timestamp }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setRecent(allActivity.slice(0, 5));

      } catch (err) {
        console.error("Fetch error:", err);
        // ✅ Safe fallback if server crashes
        setHoldings([]);
        setBoughts([]);
        setSolds([]);
        setRecent([]);
      }
    };

    fetchData();
  }, []);

  // ✅ Fix total calculations using your DB keys exactly
  const totalInvested = holdings.reduce(
    (acc, item) => acc + (Number(item.Boughtat || 0) * Number(item.Quantity || 0)), 0
  );

  const totalBought = boughts.reduce(
    (acc, item) => acc + (Number(item.Boughtat || 0) * Number(item.Quantity || 0)), 0
  );

  const totalSold = solds.reduce(
    (acc, item) => acc + (Number(item.Soldat || 0) * Number(item.Quantity || 0)), 0
  );

  return (
    <div className="userdash-wrapper">
      <h1 className="userdash-title">Your Portfolio</h1>

      <div className="userdash-grid">
        <div className="userdash-card performance-card">
          <FaChartLine className="userdash-icon" />
          <h3>Performance</h3>
        </div>

        <div className="userdash-card holdings-card">
          <FaWallet className="userdash-icon" />
          <h3>Holdings</h3>
          <p>You own {holdings.length} different stocks</p>
          <p>Total Invested Worth : $ {totalInvested.toFixed(2)}</p>
        </div>

        <div className="userdash-card buyings-card">
          <FaShoppingCart className="userdash-icon" />
          <h3>Buy History</h3>
          <p>{boughts.length} stocks bought</p>
          <p>Total Stocks Bought Worth : $ {totalBought.toFixed(2)}</p>
        </div>

        <div className="userdash-card sellings-card">
          <FaMoneyBillWave className="userdash-icon" />
          <h3>Sell History</h3>
          <p>{solds.length} transactions</p>
          <p>Your Stocks Sold Worth : $ {totalSold.toFixed(2)}</p>
        </div>
      </div>

      <div className="userdash-recent">
        <h2>Recent Activity</h2>
        <ul className="userdash-activity-list">
          {recent.length === 0 ? (
            <li>No recent activity</li>
          ) : (
            recent.map((item, index) => (
              <li key={index} className={`activity-item ${item.type}`}>
                <span className="activity-type">{item.type?.toUpperCase()}</span>
                <span className="activity-stock">{item.Stockname}</span>
                <span className="activity-qty">x{item.Quantity}</span>
                <span className="activity-price">
                  ${item.type === "BOUGHT" ? item.Boughtat : item.Soldat}
                </span>
                <span className="activity-time">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

    </div>
  );
};

export default UserDashboard;