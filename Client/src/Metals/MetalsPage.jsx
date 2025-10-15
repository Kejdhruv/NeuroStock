import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './MetalsPage.css';
import { ethers } from "ethers";
import GoldABI from '../abi/GoldABI.json';
import { toast } from 'react-hot-toast';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_GOLD_ADDRESS;

function MetalsPage() {
  const [metals, setMetalsData] = useState([]);
  const [ethPriceUSD, setEthPriceUSD] = useState(0);
  const [counter, setCounter] = useState(0);
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId] = useState(localStorage.getItem("userId"));
  const [userEmail] = useState(localStorage.getItem("userEmail"));
  const [selectedMetalObj, setSelectedMetalObj] = useState(null);
  const [weight, setWeight] = useState('');
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const allMetals = ["XAU", "XAG", "XPT", "XPD"]; // gold, silver, platinum, palladium

  // Fetch counter value
  useEffect(() => {
    const fetchCounter = async () => {
      try {
        const response = await fetch("http://localhost:3001/Counter/buyingId");
        const data = await response.json();
        setCounter(data[0].value);
      } catch (error) {
        toast.error("Failed to fetch counter.");
        console.error("Counter fetch error:", error);
      }
    };
    fetchCounter();
  }, []);

  // Fetch live metal prices
  useEffect(() => {
    const API_KEY = import.meta.env.VITE_METALS_API_KEY;
    const fetchAllMetals = async () => {
      try {
        const requests = allMetals.map(symbol =>
          fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${API_KEY}&base=USD&currencies=${symbol}`)
            .then(res => res.json())
        );
        const data = await Promise.all(requests);
        setMetalsData(data);
      } catch (error) {
        console.error("Error fetching Metal Data:", error);
        toast.error("Failed to load metal prices.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllMetals();
  }, []);

  // Fetch ETH price in USD
  useEffect(() => {
    const fetchETHPrice = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const data = await res.json();
        setEthPriceUSD(data.ethereum.usd);
      } catch (err) {
        console.error("Failed to fetch ETH price:", err);
      }
    };
    fetchETHPrice();
  }, []);

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask");
      return;
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
  };

  // Handle "Buy" button click
  const handleBuyClick = (metalObj) => {
    setSelectedMetalObj(metalObj);
    setShowModal(true);
  };

  // Confirm and process the purchase
  const confirmBuy = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask");
      return;
    }

    if (!account) await connectWallet();

    if (!weight || isNaN(weight) || weight <= 0) {
      toast.error("Enter a valid weight in grams.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, GoldABI, signer);

      const metalSymbol = Object.keys(selectedMetalObj.rates)[1];
      const usdPerOunce = selectedMetalObj.rates[metalSymbol];
      const usdPerGram = usdPerOunce / 28.3495;
      const priceInUSD = usdPerGram * weight;
      const priceInETH = priceInUSD / ethPriceUSD;

      const priceInWei = ethers.parseUnits(priceInETH.toString(), 18);
      const totalCostWei = (priceInWei * BigInt(102)) / BigInt(100); // +2% fee

      const tx = await contract.buying(
        metalSymbol,
        BigInt(weight),
        priceInWei,
        counter,
        { value: totalCostWei }
      );

      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      const BoughtData = {
        Userid: userId,
        Email: userEmail,
        MetalName: metalSymbol,
        Boughtat: usdPerGram,
        Weight: weight,
        timestamp: new Date().toISOString(),
        Transactionid: tx.hash,
        buyingid: counter,
        accountid: account
      };

      await fetch('http://localhost:3001/GoldHolding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(BoughtData),
      });

      await fetch('http://localhost:3001/GoldBought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(BoughtData),
      });

      await fetch("http://localhost:3001/Counter/buyingId", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: counter + 1 })
      });

      toast.success(`Purchased ${metalSymbol} successfully!`);
      setCounter(counter + 1);
      setWeight('');
      setShowModal(false);
    } catch (err) {
      console.error("Buy metal error:", err);
      toast.error("Transaction failed");
    }
  };

  // UI Rendering
  return (
    <div className="metals-page-container">
      <h1 className="metals-title">Live Metal Prices</h1>

      {loading ? (
        <div className="loader">Loading metal prices...</div>
      ) : (
        <div className="metals-grid">
          {metals.map((metalObj, index) => {
            const rates = metalObj.rates;
            if (!rates) return null;

            const metalSymbol = allMetals.find(m => rates[m]);
            if (!metalSymbol) return null;

            const usdPerOunce = rates[metalSymbol];
            const pricePerGram = usdPerOunce / 28.3495;

            return (
              <div key={index} className="metal-card">
                <h2>{metalSymbol}</h2>
                <p>
                  {pricePerGram
                    ? `$${pricePerGram.toFixed(2)} / gram`
                    : "Rate unavailable"}
                </p>
                <button onClick={() => handleBuyClick(metalObj)}>Buy</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Buy Modal */}
      {showModal && (
        <div className="buy-modal">
          <div className="buy-modal-content">
            <h2>Enter weight in grams</h2>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 10"
            />
            <div className="modal-buttons">
              <button onClick={confirmBuy}>Confirm Purchase</button>
              <button onClick={() => { setShowModal(false); setWeight(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MetalsPage;