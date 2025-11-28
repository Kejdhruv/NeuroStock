import React, { useEffect, useState } from 'react';
import './HoldingsPage.css';
import { FaWallet } from 'react-icons/fa';
import { ethers } from 'ethers';
import StocksABI from '../../abi/StocksABI.json';
import { toast } from 'react-hot-toast';
import StockLoader from '../../Components/Loaders/StockLoader';
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const HoldingsPage = () => {
  const [holdings, setHoldings] = useState([]);
  const [ethPriceUSD, setEthPriceUSD] = useState(null);
  const [account, setAccount] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [quote, setQuote] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [counter, setCounter] = useState(null);
  const [loading, setLoading] = useState(false); 
  

  const getETHPriceUSD = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const data = await res.json();
      setEthPriceUSD(data.ethereum.usd);
    } catch (err) {
      console.error("Failed to fetch ETH price:", err);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {

      try {
        const res = await fetch("http://localhost:3001/Counter/sellingId");
        const data = await res.json();
        setCounter(Number(data[0].value));
      } catch (err) {
        console.error("Failed to fetch counter:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
   const fetchData = async () => {
     try {
       const res = await fetch("http://localhost:3001/Profile/Holdings", { credentials: "include" });
       const data = await res.json();
       const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
       setHoldings(Array.isArray(sorted) ? sorted : []);
     } catch (error) {
       console.error("Error fetching selling history:", error);
       setHoldings([]);
     }
   };
 
   fetchData();
 }, []);
 

  const handleSellClick = async (stock) => {
    const FINNHUB_KEY = 'd23h2h9r01qm6rotacv0d23h2h9r01qm6rotacvg';
    try {
      const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.Stocksymbol}&token=${FINNHUB_KEY}`);
      const quoteData = await quoteRes.json();
      setQuote(quoteData);
      await getETHPriceUSD();
      setSelectedStock(stock);
      setQuantity(1);
      setModalOpen(true);
    } catch (error) {
      console.error("Error fetching quote:", error);
    }
  }; 

    const updateHoldingQuantity = async (stockId, quantity) => {
  try {
    await fetch(`http://localhost:3001/Holdings/${stockId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Quantity: quantity })
    });
  } catch (error) {
    console.error("Failed to update quantity:", error);
  }
};

const deleteHolding = async (stockId) => {
  try {
    await fetch(`http://localhost:3001/Holdings/${stockId}`, {
      method: "DELETE"
    });
  } catch (error) {
    console.error("Failed to delete holding:", error);
  }
};

  const confirmSell = async () => {
    if (!window.ethereum) return alert("Please install MetaMask");
    if (!account) await connectWallet();

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, StocksABI, signer);

      const stockPriceUSD = quote.c;
      const stockPriceETH = stockPriceUSD / ethPriceUSD;
      const priceInWei = ethers.parseUnits(stockPriceETH.toString(), 18); 

      const tx = await contract.selling(
        selectedStock.buyingid,
        quantity,
        priceInWei,
        counter
      );
      setModalOpen(false);
       setLoading(true);
      await tx.wait();

      const SellingData = {
        Stockname: selectedStock.Stockname,
        Stocksymbol: selectedStock.Stocksymbol,
        Soldat: quote.c,
        Quantity: quantity,
        timestamp: new Date().toISOString(),
        Transactionid: tx.hash,
        sellingid: counter,
        buyingid: selectedStock.buyingid,
        stockimage: selectedStock.stockimage,
        accountid: account
      };

      const res = await fetch('http://localhost:3001/StocksSold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(SellingData), 
        credentials: "include" , 
      });

      if (res.ok) {
        toast.success(`Stock Sold! TX Hash: ${tx.hash}`);
         setLoading(false);
        
      } else {
        const data = await res.json();
        toast.error(data.message || 'Error while saving data');
      }

      await fetch("http://localhost:3001/Counter/sellingId", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: counter + 1 })
      });

    const newQuantity = selectedStock.Quantity - quantity;
      console.log(newQuantity); 
if (newQuantity > 0) {
  await updateHoldingQuantity(selectedStock._id, newQuantity);
} else {
  await deleteHolding(selectedStock._id);
      } 
      

      // Refresh holdings
      const updated = await fetch("http://localhost:3001/Profile/Holdings", { credentials: "include" });
      const updatedData = await updated.json();
      setHoldings(updatedData);

    } catch (err) {
      console.error("Sell stock error:", err);
      alert("Transaction failed");
    }
  };

  return (
    <div className="holdings-container">
      <div className="holdings-wallet-header">
        <button onClick={connectWallet}>
          {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
        </button>
      </div>

      <div className="holdings-header-title">
        <FaWallet className="holdings-icon" />
        <span>Your Current Holdings</span>
      </div>

      <div className="holdings-table-header">
        <div></div>
        <div>Stock Name</div>
        <div>Symbol</div>
        <div>Quantity</div>
        <div>Bought At</div>
        <div>Buying ID</div>
        <div>Date</div>
        <div>Action</div>
      </div>

      {holdings.map((item, index) => (
        <div key={index} className="holdings-row">
          <img src={item.stockimage} alt={item.Stockname} className="holdings-stock-image" />
          <div className="holdings-stock-name">{item.Stockname}</div>
          <div className="holdings-stock-symbol">{item.Stocksymbol}</div>
          <div className="holdings-meta">x{item.Quantity}</div>
          <div className="holdings-meta">$ {item.Boughtat}</div>
          <div className="holdings-buying-id">{item.buyingid}</div>
          <div className="holdings-timestamp">{new Date(item.timestamp).toLocaleString()}</div>
          <div>
            <button className="holdings-sell-button" onClick={() => handleSellClick(item)}>Sell</button>
          </div>
        </div>
      ))}

      {modalOpen && selectedStock && (
        <div className="holdings-modal">
          <div className="holdings-modal-content">
            <h2>Sell {selectedStock.Stockname}</h2>
            <p>Current Price: ${quote?.c} USD ({(quote?.c / ethPriceUSD).toFixed(6)} ETH)</p>
            <label>Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              max={selectedStock.Quantity}
            />
            <div className="holdings-modal-buttons">
              <button onClick={confirmSell}>Confirm Sell</button>
              <button onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )} 

          {loading && <StockLoader />} 

    </div>
  );
};

export default HoldingsPage;