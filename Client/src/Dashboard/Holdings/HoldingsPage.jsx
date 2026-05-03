import React, { useEffect, useState } from 'react';
import './HoldingsPage.css';
import { FaWallet } from 'react-icons/fa';
import { RiTimeLine, RiSearchLine, RiPieChartLine } from 'react-icons/ri';
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

  // ── UI-only state for top cards ──────────────────────────
  const [search, setSearch] = useState('');
  const [filterSymbol, setFilterSymbol] = useState('ALL');

  // ── All original data-fetching logic unchanged ────────────

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
      await fetch(`http://localhost:3001/Holdings/${stockId}`, { method: "DELETE" });
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
        credentials: "include",
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
      if (newQuantity > 0) {
        await updateHoldingQuantity(selectedStock._id, newQuantity);
      } else {
        await deleteHolding(selectedStock._id);
      }

      const updated = await fetch("http://localhost:3001/Profile/Holdings", { credentials: "include" });
      const updatedData = await updated.json();
      setHoldings(updatedData);

    } catch (err) {
      console.error("Sell stock error:", err);
      alert("Transaction failed");
    }
  };

  // ── Derived values for top cards (read-only, no state mutation) ──

  // Card 1 — Longest held
  const longestHeld = holdings.length
    ? [...holdings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0]
    : null;

  const holdDuration = (ts) => {
    const diff = Date.now() - new Date(ts);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // Card 2 — Filter / Search unique symbols
  const uniqueSymbols = ['ALL', ...new Set(holdings.map(h => h.Stocksymbol))];

  // Card 3 — Summary per symbol
  const summaryMap = holdings.reduce((acc, h) => {
    const key = h.Stocksymbol;
    if (!acc[key]) acc[key] = { name: h.Stockname, qty: 0, value: 0, img: h.stockimage };
    acc[key].qty += h.Quantity;
    acc[key].value += h.Boughtat * h.Quantity;
    return acc;
  }, {});
  const summaryEntries = Object.entries(summaryMap);
  const totalValue = summaryEntries.reduce((s, [, v]) => s + v.value, 0);

  // Filtered holdings for the table
  const filteredHoldings = holdings.filter(h => {
    const matchSymbol = filterSymbol === 'ALL' || h.Stocksymbol === filterSymbol;
    const matchSearch = search === '' ||
      h.Stockname.toLowerCase().includes(search.toLowerCase()) ||
      h.Stocksymbol.toLowerCase().includes(search.toLowerCase());
    return matchSymbol && matchSearch;
  });

  return (
    <div className="hp-root">

      {/* ── TOPBAR ──────────────────────────────────────── */}
      <div className="hp-topbar">
        <div className="hp-page-title">
          <FaWallet className="hp-page-title__icon" />
          <span>Your Holdings</span>
        </div>
        <button className="hp-wallet-btn" onClick={connectWallet}>
          <span className="hp-wallet-btn__dot" />
          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
        </button>
      </div>

      {/* ── 3 TOP CARDS ─────────────────────────────────── */}
      <div className="hp-cards-grid">

        {/* Card 1 — Longest Hold */}
        <div className="hp-card hp-card--longest">
          <div className="hp-card__label">
            <RiTimeLine className="hp-card__label-icon" />
            Longest Hold
          </div>
          {longestHeld ? (
            <div className="hp-longest__body">
              <img src={longestHeld.stockimage} alt={longestHeld.Stockname} className="hp-longest__img" />
              <div className="hp-longest__info">
                <span className="hp-longest__name">{longestHeld.Stockname}</span>
                <span className="hp-longest__symbol">{longestHeld.Stocksymbol}</span>
                <span className="hp-longest__qty">×{longestHeld.Quantity} shares</span>
              </div>
              <div className="hp-longest__timer">{holdDuration(longestHeld.timestamp)}</div>
            </div>
          ) : (
            <p className="hp-card__empty">No holdings yet</p>
          )}
        </div>

        {/* Card 2 — Filter & Search */}
        <div className="hp-card hp-card--filter">
          <div className="hp-card__label">
            <RiSearchLine className="hp-card__label-icon" />
            Filter Holdings
          </div>
          <div className="hp-filter__search-wrap">
            <RiSearchLine className="hp-filter__search-icon" />
            <input
              className="hp-filter__search"
              type="text"
              placeholder="Search by name or symbol…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="hp-filter__chips">
            {uniqueSymbols.map(sym => (
              <button
                key={sym}
                className={`hp-filter__chip${filterSymbol === sym ? ' hp-filter__chip--active' : ''}`}
                onClick={() => setFilterSymbol(sym)}
              >
                {sym}
              </button>
            ))}
          </div>
          <div className="hp-filter__count">
            Showing <strong>{filteredHoldings.length}</strong> of {holdings.length} holdings
          </div>
        </div>

        {/* Card 3 — Summary */}
        <div className="hp-card hp-card--summary">
          <div className="hp-card__label">
            <RiPieChartLine className="hp-card__label-icon" />
            Portfolio Summary
          </div>
          <div className="hp-summary__list">
            {summaryEntries.slice(0, 4).map(([sym, val]) => (
              <div key={sym} className="hp-summary__row">
                <img src={val.img} alt={sym} className="hp-summary__img" />
                <span className="hp-summary__sym">{sym}</span>
                <span className="hp-summary__qty">×{val.qty}</span>
                <span className="hp-summary__val">${val.value.toFixed(0)}</span>
              </div>
            ))}
            {summaryEntries.length > 4 && (
              <div className="hp-summary__more">+{summaryEntries.length - 4} more</div>
            )}
          </div>
          <div className="hp-summary__total">
            <span>Total Invested</span>
            <strong>${totalValue.toFixed(2)}</strong>
          </div>
        </div>

      </div>

      {/* ── HOLDINGS TABLE ───────────────────────────────── */}
      <div className="hp-table-wrap">
        <div className="hp-table-head">
          <div></div>
          <div>Stock</div>
          <div>Symbol</div>
          <div>Qty</div>
          <div>Bought At</div>
          <div>Buying ID</div>
          <div>Date</div>
          <div>Action</div>
        </div>

        {filteredHoldings.length === 0 ? (
          <div className="hp-table-empty">No holdings match your filter.</div>
        ) : (
          filteredHoldings.map((item, index) => (
            <div key={index} className="hp-table-row" style={{ animationDelay: `${index * 40}ms` }}>
              <img src={item.stockimage} alt={item.Stockname} className="hp-row__img" />
              <div className="hp-row__name">{item.Stockname}</div>
              <div className="hp-row__symbol">{item.Stocksymbol}</div>
              <div className="hp-row__meta">×{item.Quantity}</div>
              <div className="hp-row__meta">${item.Boughtat}</div>
              <div className="hp-row__id">{item.buyingid}</div>
              <div className="hp-row__date">{new Date(item.timestamp).toLocaleString()}</div>
              <div>
                <button className="hp-sell-btn" onClick={() => handleSellClick(item)}>Sell</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── SELL MODAL (unchanged) ───────────────────────── */}
      {modalOpen && selectedStock && (
        <div className="hp-modal">
          <div className="hp-modal__content">
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
            <div className="hp-modal__buttons">
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