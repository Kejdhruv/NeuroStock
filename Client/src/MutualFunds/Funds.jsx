import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './Funds.css';

function Funds() {
  const [funds, setFunds] = useState([]);
  const navigate = useNavigate();

  const allFunds = [
    "125497", "125498", "120589", "149059", "120828", "119551", "118945"
  ];

  useEffect(() => {
    const fetchAllFunds = async () => {
      try {
        const requests = allFunds.map(code =>
          fetch(`https://api.mfapi.in/mf/${code}`)
            .then(res => res.json())
        );
        const data = await Promise.all(requests);
        setFunds(data);
      } catch (error) {
        console.error("Error fetching funds:", error);
      }
    };
    fetchAllFunds();
  }, []);

  const handleClick = (scheme_code) => {
    navigate(`/Fund/${scheme_code}`);
  };

  if (funds.length === 0) return (
    <div className="loader-container">
      <div className="emoji-loader">
        <span>💹</span>
        <span>➡️</span>
        <span>💰</span>
        <span>➡️</span>
        <span>📈</span>
      </div>
    </div>
  );

  return (
    <div className="fund-container">
      {funds.map((fund, index) => {
        const latestNAV = fund.data[0]?.nav; 
        return (
          <div key={index} className="fund-card">
            <h2>{fund.meta.scheme_name}</h2>
            <p><strong>Fund House:</strong> {fund.meta.fund_house}</p>
            <p><strong>Category:</strong> {fund.meta.scheme_category}</p>
            <p><strong>Type:</strong> {fund.meta.scheme_type}</p>
            {latestNAV && <p><strong>Latest NAV:</strong> ₹{parseFloat(latestNAV).toFixed(2)}</p>}
            
            <div className="fund-footer">
              <button onClick={() => handleClick(fund.meta.scheme_code)}>
                View Details
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Funds;
