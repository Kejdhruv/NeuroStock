import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import './StocksPage.css';
import { ethers } from "ethers";
import StocksABI from '../../abi/StocksABI.json';
import { toast } from 'react-hot-toast';
import StockLoader from '../../Components/Loaders/StockLoader';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function StocksPage() {
  const { ticker } = useParams();
  const [profile, setProfile] = useState(null);
  const [quote, setQuote] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [candleData, setCandleData] = useState([]);
  const [ethPriceUSD, setEthPriceUSD] = useState(null);
  const [account, setAccount] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);  // initial value
  const [mlData, setMlData] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState(null);

  // --- small helper: turn mlData into series for the right-hand chart
  const buildPredictionSeries = () => {
    if (!mlData || !mlData.next_10_real_predictions) return [];
    return mlData.next_10_real_predictions.map((p, i) => ({
      date: `T+${i + 1}`,
      price: Number(p)
    }));
  };

  // --- small internal PredictionChart using your existing Recharts imports
  const PredictionChart = ({ data }) => {
    if (!data || data.length === 0) {
      return <div style={{ padding: 18 }}>No predictions yet</div>;
    }
    return (
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['dataMin', 'dataMax']} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#0b1e3f" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  useEffect(() => {
    const fetchCounter = async () => {
      try {
        const response = await fetch("http://localhost:3001/Counter/buyingId");
        const data = await response.json();
        setCounter(data[0].value);  // ✅ set the counter
      } catch (error) {
        toast.error("Failed to fetch counter.");
        console.error("Counter fetch error:", error);
      }
    };

    fetchCounter();  // ✅ Called as async function
  }, []);

  useEffect(() => {
    console.log("Counter updated:", counter);
  }, [counter]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const connectedAccount = accounts[0];
      setAccount(connectedAccount);
      alert("Connected: " + connectedAccount);
    } catch (err) {
      console.error("Wallet connect failed:", err);
    }
  };

  const getETHPriceUSD = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const data = await res.json();
      setEthPriceUSD(data.ethereum.usd);
    } catch (err) {
      console.error("Failed to fetch ETH price:", err);
    }
  };

  const handleBuyClick = () => {
    setModalOpen(true);
  };

  const buyStock = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    if (!account) await connectWallet();

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, StocksABI, signer);

      const stockPriceUSD = quote.c;
      const stockPriceETH = stockPriceUSD / ethPriceUSD;
      const priceInWei = ethers.parseUnits(stockPriceETH.toString(), 18);

      const totalCostWei = (priceInWei * BigInt(quantity) * BigInt(102)) / BigInt(100);

      const tx = await contract.buying(
        profile.name,
        BigInt(quantity),
        priceInWei,
        counter,
        { value: totalCostWei }
      );

      console.log("Transaction submitted. Hash:", tx.hash);
      setModalOpen(false);
      setLoading(true);
      const receipt = await tx.wait();
      console.log("Transaction confirmed. Receipt:", receipt);

      const BoughtData = {
        Stockname: profile.name,
        Stocksymbol: profile.ticker,
        Boughtat: quote.c,
        Quantity: quantity,
        timestamp: new Date().toISOString(),
        Transactionid: tx.hash,
        buyingid: counter,
        stockimage: profile.logo,
        accountid: account
      };

      const res = await fetch('http://localhost:3001/Holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(BoughtData),
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Stock purchased! TX Hash: ${tx.hash}`);
        setLoading(false);
      } else {
        toast.error(data.message || 'Error while saving data');
      }

      // Increment counter
      await fetch("http://localhost:3001/Counter/buyingId", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: counter + 1 })
      });

    } catch (err) {
      console.error("Buy stock error:", err);
      alert("Transaction failed");
    }
  };

  useEffect(() => {
    const FINNHUB_KEY = import.meta.env.VITE_2ND_FINHUBB_KEY;
    const POLYGON_KEY = import.meta.env.VITE_3RD_POLYGON_KEY;

    const fetchStockData = async () => {
      try {
        const [profileRes, quoteRes, metricRes, recommendationRes] = await Promise.all([
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${FINNHUB_KEY}`),
          fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`),
          fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${FINNHUB_KEY}`),
          fetch(`https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${FINNHUB_KEY}`)
        ]);

        setProfile(await profileRes.json());
        setQuote(await quoteRes.json());
        const metricData = await metricRes.json();
        setMetrics(metricData?.metric || {});
        setRecommendations(await recommendationRes.json() || []);
        await getETHPriceUSD();
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    const fetchCandleData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Go back 150 days to ensure at least 100 trading days
        const hundredDaysAgo = new Date();
        hundredDaysAgo.setDate(hundredDaysAgo.getDate() - 150);
        const fromDate = hundredDaysAgo.toISOString().split('T')[0];

        const res = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${today}?adjusted=true&sort=asc&limit=100&apiKey=${POLYGON_KEY}`
        );

        const data = await res.json();
        if (data && data.results) {
          const transformedData = data.results.map((item, i) => ({
            // include idx if you want clickable-candle features later
            idx: i,
            date: new Date(item.t).toLocaleDateString(),
            open: item.o,
            high: item.h,
            low: item.l,
            close: item.c,
          }));

          // set state first
          setCandleData(transformedData);

          // only call PredictionModule AFTER candleData is ready
          if (transformedData.length >= 100) {
            // pass the transformedData directly to PredictionModule to avoid race
            await PredictionModule(transformedData);
          } else {
            // pad & still call (optional) — here we warn
            console.warn("Not enough rows for ML (need 100). Have:", transformedData.length);
          }
        }
      } catch (error) {
        console.error("Error fetching candle data:", error);
      }
    };

    // Accept an optional data param to avoid reading stale candleData from state
    const PredictionModule = async (data = null) => {
      try {
        setMlError(null);
        setMlLoading(true);

        // prefer passed data; otherwise use candleData from state
        const source = Array.isArray(data) ? data : candleData;

        // normalize and ensure numeric fields
        const normalized = source.map(d => ({
          date: d.date,
          open: Number(d.open),
          high: Number(d.high),
          low: Number(d.low),
          close: Number(d.close),
        }));

        // take last 100 rows
        let timeseries = normalized.slice(-100);

        // if less than 100, pad by repeating the first row (so backend accepts)
        if (timeseries.length < 100) {
          const needed = 100 - timeseries.length;
          const padItem = timeseries.length > 0 ? timeseries[0] : {
            date: new Date().toLocaleDateString(),
            open: 0, high: 0, low: 0, close: 0
          };
          const padArray = Array.from({ length: needed }, () => ({ ...padItem }));
          timeseries = [...padArray, ...timeseries];
        }

        console.log("Sending timeseries length:", timeseries.length); // should be 100

        const resp = await fetch("http://localhost:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeseries }),
          credentials: "include"
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Backend error ${resp.status}: ${text}`);
        }

        const json = await resp.json();
        console.log("ML Prediction:", json);
        setMlData(json);
        return json;
      } catch (error) {
        console.error("ML Prediction failed:", error);
        toast.error("ML Prediction failed: " + (error.message || error));
        setMlData(null);
        setMlError(error.message || String(error));
        return null;
      } finally {
        setMlLoading(false);
      }
    };

    fetchStockData();
    fetchCandleData();
    // PredictionModule is called inside fetchCandleData after setCandleData
  }, [ticker]); 

  const MiniLoader = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  }}>
    <div className="mini-spinner"></div>
    <span style={{ fontSize: "12px", fontWeight: 600 }}>Predicting the Stock Trend </span>
  </div>
); 

  if (!profile || !quote || !metrics || !ethPriceUSD) return <div className="loader-container">
    <div className="emoji-loader">
      <span>💹</span>
      <span>➡️</span>
      <span>💰</span>
      <span>➡️</span>
      <span>📈</span>
    </div>
  </div>;

  const minPrice = Math.min(...candleData.map((d) => d.low || d.close));
  const maxPrice = Math.max(...candleData.map((d) => d.high || d.close));
  const stockPriceUSD = quote.c.toFixed(2);
  const stockPriceETH = (stockPriceUSD / ethPriceUSD).toFixed(6);

  const renderCandle = (props) => {
    const { x, width, payload, y, height } = props;
    const color = payload.close >= payload.open ? "#2ecc71" : "#e74c3c";
    const priceToY = (price) => y + height - ((price - minPrice) / (maxPrice - minPrice)) * height;
    const top = priceToY(Math.max(payload.open, payload.close));
    const bottom = priceToY(Math.min(payload.open, payload.close));
    const wickHigh = priceToY(payload.high);
    const wickLow = priceToY(payload.low);
    const centerX = x + width / 2;

    return (
      <g>
        <line x1={centerX} x2={centerX} y1={wickHigh} y2={wickLow} stroke={color} strokeWidth="2" />
        <rect
          x={centerX - width / 4}
          y={top}
          width={width / 2}
          height={bottom - top || 1}
          fill={color}
        />
      </g>
    );
  };

  return (
    <div className="dashboard-container">

      {/* Left Column */}
      <div className="chart-left">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={recommendations} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="strongBuy" fill="#2e8b57" />
            <Bar dataKey="buy" fill="#0b1e3f" />
            <Bar dataKey="hold" fill="#ffa500" />
            <Bar dataKey="sell" fill="#ff4500" />
            <Bar dataKey="strongSell" fill="#b22222" />
          </BarChart>
        </ResponsiveContainer>

        {/* --- REPLACED: Prediction chart takes the place of the old metrics card --- */}
       <div className="prediction-panel" 
     style={{ marginTop: 8, maxHeight: 50 }}>

  <div className="chart-card" 
       style={{ padding: "6px 10px", minHeight: 50 }}>

    <div className="chart-title" 
         style={{ padding: "6px 10px" , fontSize: 20, fontWeight: 700 , marginBottom: 8 }}>
      Stock Prediction (next 3 days)
    </div>

    <div style={{ position: 'relative', minHeight: 40 }}>
      {mlLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.5)',
          zIndex: 5,
          borderRadius: 6
        }}>
          <MiniLoader small />
        </div>
      )}

      {!mlLoading && <PredictionChart data={buildPredictionSeries()} />}
    </div>

  </div>
</div>
      </div>

      {/* Right Column */}
      <div className="right-section">
        <div className="profile-card">
          <div className="profile-left">
            <img src={profile.logo} alt={profile.name} className="profile-logo" />
            <div className="profile-info">
              <div className="profile-title">{profile.name} ({profile.ticker})</div>
              <div className="profile-text"><strong>Exchange:</strong> {profile.exchange || "NA"}</div>
              <div className="profile-text"><strong>Industry:</strong> {profile.finnhubIndustry || "NA"}</div>
              <div className="profile-text"><strong>Country:</strong> {profile.country || "NA"}</div>
              <div className="profile-text"><strong>IPO Date:</strong> {profile.ipo || "NA"}</div>
              <div className="profile-text"><strong>Share Outstanding:</strong> {profile.shareOutstanding || "NA"}</div>
              <div className="profile-text"><strong>Market Cap:</strong> {metrics.marketCapitalization || "NA"} B</div>
              <div className="profile-text">
                <strong>Website:</strong>{" "}
                {profile.weburl ? (
                  <a href={profile.weburl} target="_blank" rel="noopener noreferrer" className="profile-link">
                    {profile.weburl}
                  </a>
                ) : (
                  "NA"
                )}
              </div>
            </div>
          </div>
          <div className="quote-card-inside">
            <div className="section-title">Stock Price</div>
            <ul>
              <li className="quote-text"><strong>Current:</strong> ${quote.c} (~ {stockPriceETH} ETH)</li>
              <li className="quote-text"><strong>Open:</strong> ${quote.o}</li>
              <li className="quote-text"><strong>Previous Close:</strong> ${quote.pc}</li>
              <li className="quote-text"><strong>High:</strong> ${quote.h}</li>
              <li className="quote-text"><strong>Low:</strong> ${quote.l}</li>
            </ul>
            <button className="buy-stock-button" onClick={handleBuyClick}>Buy Stock</button>
            <button className="buy-stock-button" onClick={connectWallet}>Connect Wallet</button>
          </div>
        </div>

        {/* Candlestick Chart */}
        <div className="candlestick-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={candleData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis domain={[minPrice * 0.98, maxPrice * 1.02]} />
              <Tooltip />
              <Bar dataKey="close" fill="#0b1e3f" shape={renderCandle} />
            </BarChart>
          </ResponsiveContainer>
        </div>

          <div className="metrics-row" style={{ marginTop: 1 }}>
        {metrics && (
          <div className="metrics-card full-width">
            <h3>Key Metrics</h3>
            <ul>
              <li><strong>P/E Ratio:</strong> {metrics.peBasicExclExtraTTM || 'N/A'}</li>
              <li><strong>52 Week High:</strong> $ {metrics['52WeekHigh'] || 'N/A'} on { `(${metrics['52WeekHighDate']})`}</li>
              <li><strong>52 Week Low:</strong> $ {metrics['52WeekLow'] || 'N/A'} on { `(${metrics['52WeekLowDate']})`}</li>
              <li><strong>13 Week Price Return Daily </strong> $ {metrics['13WeekPriceReturnDaily'] || 'N/A'}</li>
              <li><strong>26 Week Price Return Daily </strong> $ {metrics['26WeekPriceReturnDaily'] || 'N/A'}</li>
              <li><strong>52 Week Price Return Daily </strong> $ {metrics['52WeekPriceReturnDaily'] || 'N/A'}</li>
            </ul>
          </div>
        )}
      </div>
      </div>

      {/* --- MOVED: metrics now span full width below the charts --- */}
  

      {/* Buy Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Buy {ticker}</h2>
            <p>Price: ${stockPriceUSD} (~ {stockPriceETH} ETH)</p>
            <label>
              Quantity:
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            <p><strong>Total:</strong> {(stockPriceETH * quantity).toFixed(6)} ETH</p>
            <div className="modal-buttons">
              <button onClick={buyStock} className="confirm-btn">Confirm Buy</button>
              <button onClick={() => setModalOpen(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {loading && <StockLoader />}

    </div>
  );
}

export default StocksPage;