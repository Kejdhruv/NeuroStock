import React, { useEffect, useState } from "react";
import "./UserDashhboard.css";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import Avatar1 from "../../assets/Ballerina.png";
import Avatar2 from "../../assets/Brian.png";
import Avatar3 from "../../assets/Camila.png";
import Avatar4 from "../../assets/John.png";
import Avatar5 from "../../assets/Lucia.png";
import Avatar6 from "../../assets/Roony.png";

const avatars = [Avatar1, Avatar2, Avatar3, Avatar4, Avatar5, Avatar6];

const API_HOLD = "http://localhost:3001/Profile/Holdings";
const API_BUY = "http://localhost:3001/Profile/Boughts";
const API_SELL = "http://localhost:3001/Profile/SoldStocks";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [ethPrice, setEthPrice] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [boughts, setBoughts] = useState([]);
  const [solds, setSolds] = useState([]);
  const [recent, setRecent] = useState([]);
  const [longestHold, setLongestHold] = useState(null);
  const [timer, setTimer] = useState("");

  useEffect(() => {
    setAvatar(avatars[Math.floor(Math.random() * avatars.length)]);
    fetchAll();
    fetchETH();
    fetchUser();
  }, []);

  useEffect(() => {
    if (!longestHold) return;
    const interval = setInterval(() => {
      const start = new Date(longestHold.timestamp);
      const now = new Date();
      const diff = now - start;
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimer(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [longestHold]);

  const fetchUser = async () => {
    const res = await fetch("http://localhost:3001/Auth/Me", { credentials: "include" });
    const data = await res.json();
    if (data.loggedIn) setUser(data.user);
  };

  const fetchETH = async () => {
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
      const data = await res.json();
      setEthPrice(data.ethereum.usd);
    } catch (e) { console.error("ETH Fetch failed"); }
  };

  const fetchAll = async () => {
    const [hRes, bRes, sRes] = await Promise.all([
      fetch(API_HOLD, { credentials: "include" }),
      fetch(API_BUY, { credentials: "include" }),
      fetch(API_SELL, { credentials: "include" }),
    ]);

    const h = await hRes.json();
    const b = await bRes.json();
    const s = await sRes.json();

    setHoldings(h || []);
    setBoughts(b || []);
    setSolds(s || []);

    const allActivity = [
      ...b.map((i) => ({ ...i, type: "BUY" })),
      ...s.map((i) => ({ ...i, type: "SELL" })),
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    setRecent([...allActivity].reverse().slice(0, 4));

    if (h.length) {
      const oldest = [...h].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0];
      setLongestHold(oldest);
    }
  };

  const chartData = [
    ...boughts.map(b => ({ date: new Date(b.timestamp), buy: b.Boughtat })),
    ...solds.map(s => ({ date: new Date(s.timestamp), sell: s.Soldat }))
  ].sort((a, b) => a.date - b.date)
    .map(item => ({
      ...item,
      displayDate: item.date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }));

  const totalBuy = boughts.reduce((a, i) => a + i.Boughtat * i.Quantity, 0);
  const totalSell = solds.reduce((a, i) => a + i.Soldat * i.Quantity, 0);
  const netProfit = totalSell - totalBuy;

  return (
    <div className="db-container">
      {/* HEADER SECTION */}
      <header className="db-header">
        <div className="db-user-block">
          <div className="db-avatar-container">
            <img src={avatar} alt="User" className="db-avatar-img" />
            <div className="db-status-badge" />
          </div>
          <div className="db-user-meta">
            <h1>{user?.firstName} {user?.lastName}</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="db-eth-card">
          <div className="db-eth-info">
            <span className="db-tag">Market Live</span>
            <h3>Ethereum</h3>
          </div>
          <div className="db-eth-price">
            ${ethPrice.toLocaleString()}
            <span className="db-currency">USD</span>
          </div>
        </div>
      </header>

      <main className="db-main-grid">
        {/* BLOCK 1: GRAPH (Span 2) */}
        <section className="db-card db-graph-area">
          <div className="db-card-head">
            <h3>Portfolio Analytics</h3>
            <div className="db-graph-legend">
              <span className="lg-buy">Buy Points</span>
              <span className="lg-sell">Sell Points</span>
            </div>
          </div>
          <div className="db-chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} minTickGap={20} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="buy" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorBuy)" dot={{ r: 4, fill: '#2563eb' }} />
                <Area type="monotone" dataKey="sell" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorSell)" dot={{ r: 4, fill: '#f43f5e' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* BLOCK 2: LONGEST HOLD (Span 1) */}
        <section className="db-card db-hold-feature">
          <div className="db-card-head">
            <h3>Longest Hold</h3>
          </div>
          {longestHold ? (
            <div className="db-hold-content">
              <div className="db-hold-icon">
                <img src={longestHold.stockimage} alt="Stock" />
              </div>
              <h4>{longestHold.Stockname}</h4>
              <p>{longestHold.Quantity} Shares Held</p>
              <div className="db-hold-timer-block">
                <span>Time in Portfolio</span>
                <div className="db-timer-value">{timer}</div>
              </div>
            </div>
          ) : (
            <div className="db-empty">No active holdings</div>
          )}
        </section>

        {/* BLOCK 3: SUMMARY BLOCK (Span 2) */}
        <section className="db-card db-summary-card">
          <div className="db-card-head">
            <h3>Financial Performance</h3>
          </div>
          <div className="db-summary-grid">
            <div className="db-summary-item">
              <span className="db-summary-label">Total Invested</span>
              <div className="db-summary-value invest">${totalBuy.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="db-summary-divider" />
            <div className="db-summary-item">
              <span className="db-summary-label">Total Returned</span>
              <div className="db-summary-value return">${totalSell.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="db-summary-divider" />
            <div className="db-summary-item">
              <span className="db-summary-label">Net Gain/Loss</span>
              <div className={`db-summary-value ${netProfit >= 0 ? 'profit' : 'loss'}`}>
                {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </section>

        {/* BLOCK 4: RECENT ACTIVITY (Span 1) */}
        <section className="db-card db-recent-activity">
          <div className="db-card-head">
            <h3>Recent Activity</h3>
          </div>
          <div className="db-activity-list">
            {recent.map((item, idx) => (
              <div key={idx} className="db-activity-row">
                <div className={`db-type-icon ${item.type.toLowerCase()}`}>
                  {item.type === 'BUY' ? '↓' : '↑'}
                </div>
                <div className="db-activity-info">
                  <span className="db-act-name">{item.Stockname}</span>
                  <span className="db-act-date">{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="db-activity-val">
                  {item.Quantity}u
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default UserDashboard;