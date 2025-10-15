import React, { useEffect, useState } from "react";
import "./UserDashhboard.css";
import { FaChartLine, FaWallet, FaShoppingCart, FaMoneyBillWave } from "react-icons/fa";
import Avatar1 from "../assets/Ballerina.png" 
import Avatar2 from "../assets/Brian.png" 
import Avatar3 from "../assets/Camila.png" 
import Avatar4 from "../assets/John.png"
import Avatar5 from "../assets/Lucia.png" 
import Avatar6 from "../assets/Roony.png" 


const UserDashboard = () => {
  const [holdings, setHoldings] = useState([]);
  const [boughts, setBoughts] = useState([]);
  const [solds, setSolds] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("userId");
      console.log("User ID from localStorage:", userId);

      if (!userId) {
        console.warn("No userId found in localStorage.");
        return;
      }

      try {
        const [holdRes, buyRes, sellRes] = await Promise.all([
          fetch(`http://localhost:3001/Profile/Holdings/${userId}`).catch(err => {
            console.error("Holdings fetch failed:", err);
            return { json: () => [] };
          }),
          fetch(`http://localhost:3001/Profile/Boughts/${userId}`).catch(err => {
            console.error("Boughts fetch failed:", err);
            return { json: () => [] };
          }),
          fetch(`http://localhost:3001/Profile/SoldStocks/${userId}`).catch(err => {
            console.error("Sold fetch failed:", err);
            return { json: () => [] };
          }),
        ]);

       const holdData = await holdRes.json();
const buyDataRaw = await buyRes.json();
const sellDataRaw = await sellRes.json();

const buyData = buyDataRaw.map((item) => ({ ...item, type: "BOUGHT" }));
const sellData = sellDataRaw.map((item) => ({ ...item, type: "SOLD" }));

setHoldings(Array.isArray(holdData) ? holdData : []);
setBoughts(Array.isArray(buyData) ? buyData : []);
setSolds(Array.isArray(sellData) ? sellData : []);

const allActivity = [...buyData, ...sellData].sort(
  (a, b) => new Date(b.time) - new Date(a.time)
);
setRecent(allActivity.slice(0, 5)); // latest 5 activities
      } catch (err) {
        console.error("Unexpected data fetch error:", err);
      }
    };

    fetchData();
  }, []);


  const totalBought= boughts.reduce((acc, item) => acc + (item.Boughtat || 0) * (item.Quantity || 0), 0);
  const totalInvested = holdings.reduce((acc, item) => acc + (item.Boughtat || 0) * (item.Quantity || 0), 0);
  const totalSold = solds.reduce((acc, item) => acc + (item.Soldat || 0) * (item.Quantity || 0), 0);

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
  ${item.Boughtat ? item.Boughtat : item.Soldat}
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