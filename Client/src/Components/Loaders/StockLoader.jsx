import React from "react";
import "./StockLoader.css";
import ethLogo from "../../assets/ethereum-eth-logo.png"; // Use a transparent Ethereum logo

const StockLoader = () => {
  return (
    <div className="eth-loader-overlay">
      <div className="eth-loader-container glass-effect">
        <img src={ethLogo} alt="Ethereum" className="eth-logo" />
        <div className="pulse-line">
          <div className="pulse"></div>
        </div>
        <p className="eth-loader-text">Powering your transaction through the chain...</p>
      </div>
    </div>
  );
};

export default StockLoader;