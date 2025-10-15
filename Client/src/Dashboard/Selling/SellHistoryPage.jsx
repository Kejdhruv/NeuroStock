import React, { useEffect, useState } from 'react';
import './SellHistoryPage.css';
import { FaMoneyBillWave, FaExternalLinkAlt } from 'react-icons/fa';

const SellHistoryPage = () => {
  const [solds, setsolds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("userId"); 
      if (!userId) return;

      try {
        const res = await fetch(`http://localhost:3001/Profile/SoldStocks/${userId}`);
        const data = await res.json();
        const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setsolds(Array.isArray(sorted) ? sorted : []);
      } catch (error) {
        console.error("Error fetching selling history:", error);
        setsolds([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="sell-history-container">
      <div className="sell-history-title">
        <FaMoneyBillWave className="sell-icon" />
        <span>Your Selling History</span>
      </div>

      <div className="sell-header">
        <div></div>
        <div>Stock Name</div>
        <div>Symbol</div>
        <div>Quantity</div>
        <div>Sold At</div>
        <div>Buying ID</div>
        <div>Selling ID</div>
        <div>Date</div>
      </div>

   {solds.map((item, index) => (
  <div key={index} className="sell-row">
    <img src={item.stockimage} alt={item.Stockname} className="sell-image" />
    <div className="sell-name">{item.Stockname}</div>
    <div className="sell-symbol">{item.Stocksymbol}</div>
    <div className="sell-qty">x{item.Quantity}</div>
    <div className="sell-price">$ {item.Soldat}</div>
    <div className="sell-buying-id">{item.buyingid}</div>
    <div className="sell-selling-id">{item.sellingid}</div>
    <div className="sell-date">{new Date(item.timestamp).toLocaleDateString()}</div>

    {/* 🔗 Now inside the card */}
    {item.Transactionid && (
      <div className="etherscan-link-row">
        <a
          href={`https://sepolia.etherscan.io/tx/${item.Transactionid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="etherscan-link"
        >
          View on Etherscan <FaExternalLinkAlt style={{ marginLeft: '4px' }} />
        </a>
      </div>
    )}
  </div>
))}
    </div>
  );
};

export default SellHistoryPage;