import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './Stocks.css'; // Import the CSS

function StockCard() {
  const [stocks, setStocks] = useState([]);
  const navigate = useNavigate();

  const allstocks = [
    "AAPL", "MSFT", "AMZN", "TSLA", "NVDA", "META", "NFLX",
    "AMD", "PYPL", "ORCL", "PEP", "V", "DIS", "MA" , "BAC" , "KO" , 
  ];

  useEffect(() => {
    const API_KEY = import.meta.env.VITE_1ST_FINHUBB_KEY; ;
    const fetchAllStocks = async () => {
      try {
        const requests = allstocks.map(symbol =>
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`)
            .then(res => res.json())
        );
        const data = await Promise.all(requests);
        setStocks(data);
      } catch (error) {
        console.error("Error fetching stocks:", error);
      }
    };
    fetchAllStocks();
  }, []);

  const handleClick = (ticker) => {
    navigate(`/Stock/${ticker}`);
  };

  if (stocks.length === 0) return <div class="loader-container">
  <div class="emoji-loader">
    <span>💹</span>
    <span>➡️</span>
    <span>💰</span>
    <span>➡️</span>
    <span>📈</span>
  </div>
</div>

 return (
  <div className="stock-container">
    {stocks.map((stock, index) => (
      <div key={index} className="stock-card">
        <img src={stock.logo} alt={`${stock.name} logo`} />
        <h2>{stock.name} ({stock.ticker})</h2>
        <div className="stock-industry">{stock.finnhubIndustry}</div>
        
        <div className="stock-details">
          <p><strong>Exchange:</strong> {stock.exchange}</p>
          {stock.marketCapitalization && (
            <p><strong>Market Cap:</strong> ${stock.marketCapitalization.toFixed(2)} M</p>
          )}
          {stock.shareOutstanding && (
            <p><strong>Shares:</strong> {stock.shareOutstanding} M</p>
          )}
        </div>

        <div className="stock-footer">
          <button onClick={() => handleClick(stock.ticker)}>
            View
          </button>
          <a href={stock.weburl} target="_blank" rel="noopener noreferrer">Website</a>
        </div>
      </div>
    ))}
  </div>
);
}

export default StockCard;