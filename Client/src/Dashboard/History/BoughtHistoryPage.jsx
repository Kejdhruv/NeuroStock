import React, { useEffect, useState } from 'react';
import './BoughtHistory.css';
import { FaShoppingCart , FaExternalLinkAlt } from 'react-icons/fa';

const BoughtHistoryPage = () => {
  const [boughts, setBoughts] = useState([]);

  useEffect(() => {
   const fetchData = async () => {
     try {
       const res = await fetch("http://localhost:3001/Profile/Boughts", { credentials: "include" });
       const data = await res.json();
       const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
       setBoughts(Array.isArray(sorted) ? sorted : []);
     } catch (error) {
       console.error("Error fetching selling history:", error);
       setBoughts([]);
     }
   };
 
   fetchData();
 }, []);

  return (
    <div className="buy-history-container">
      <div className="buy-history-header-title">
        <FaShoppingCart className="buy-icon" />
        <span>Your Buying History</span>
      </div>

      <div className="buy-history-header">
        <div></div>
        <div>Stock Name</div>
        <div>Symbol</div>
        <div>Quantity</div>
        <div>Bought At</div>
        <div>Buying ID</div>
        <div>Date</div>
      </div>

      {boughts.map((item, index) => (
        <div key={index} className="buy-history-row">
          <img src={item.stockimage} alt={item.Stockname} className="buy-image" />
          <div className="buy-name">{item.Stockname}</div>
          <div className="buy-symbol">{item.Stocksymbol}</div>
          <div className="buy-meta">x{item.Quantity}</div>
          <div className="buy-meta">$ {item.Boughtat}</div>
          <div className="buying-id">{item.buyingid}</div>
          <div className="timestamp">
            {new Date(item.timestamp).toLocaleString()}
          </div>

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

export default BoughtHistoryPage;