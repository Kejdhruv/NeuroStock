import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { RiLoader4Line, RiArrowRightUpLine, RiBankCardLine, RiFocus2Line } from "react-icons/ri";
import './Funds.css';
import NeuroFooter from '../Components/Footer/footer';

function Funds() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const allFunds = [
    "125497", "125498", "120589", "149059", "120828", "119551", "118945"
  ];

  useEffect(() => {
    const fetchAllFunds = async () => {
      try {
        const requests = allFunds.map(code =>
          fetch(`https://api.mfapi.in/mf/${code}`).then(res => res.json())
        );
        const data = await Promise.all(requests);
        setFunds(data);
      } catch (error) {
        console.error("Error fetching funds:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllFunds();
  }, []);

  const handleClick = (scheme_code) => {
    navigate(`/MutualFunds/${scheme_code}`);
  };

  if (loading) return (
    <div className="mf-loader-wrapper">
      <RiLoader4Line className="mf-loader-icon" />
      <p>Optimizing Portfolio View...</p>
    </div>
  );

  return (
    <>
    <div className="mf-root">


      <div className="mf-grid">
        {funds.map((fund, index) => {
          const latestNAV = fund.data[0]?.nav;
          const category = fund.meta.scheme_category;
          
          return (
            <div key={index} className="mf-card" onClick={() => handleClick(fund.meta.scheme_code)}>
              <div className="mf-card-top">
                <div className="mf-icon-box">
                  <RiBankCardLine />
                </div>
                <div className="mf-badge">{fund.meta.scheme_type}</div>
              </div>

              <div className="mf-card-body">
                <h2 className="mf-scheme-name">{fund.meta.scheme_name}</h2>
                <div className="mf-house-tag">{fund.meta.fund_house}</div>
                
                <div className="mf-nav-block">
                  <span className="mf-label">Current NAV</span>
                  <div className="mf-nav-value">
                    ₹{parseFloat(latestNAV).toFixed(2)}
                    <RiArrowRightUpLine className="mf-trend-icon" />
                  </div>
                </div>
              </div>

              <div className="mf-card-footer">
                <div className="mf-category">
                   <RiFocus2Line />
                   <span>{category.length > 25 ? category.substring(0, 25) + '...' : category}</span>
                </div>
                <button className="mf-view-btn">Details</button>
              </div>
            </div>
          );
        })}
      </div>
      </div>
      <NeuroFooter/>
      </>
  );
}

export default Funds;