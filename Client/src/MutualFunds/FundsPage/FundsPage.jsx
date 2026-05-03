import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./FundsPage.css";
import { toast } from "react-hot-toast";
import { RiLoader4Line, RiHistoryLine, RiCalculatorLine, RiInformationLine, RiPulseLine } from "react-icons/ri";
import NeuroFooter from "../../Components/Footer/footer";

function FundsPage() {
  const { schemeCode } = useParams();
  const [meta, setMeta] = useState(null);
  const [navSeries, setNavSeries] = useState([]);
  const [inrAmount, setInrAmount] = useState("");
  const [targetNav, setTargetNav] = useState("");
  const [units, setUnits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFund = async () => {
      try {
        const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
        const json = await res.json();
        const m = json.meta || json?.Meta || null;
        const raw = json.data || [];

        const series = raw
          .map((r) => ({
            date: r.date,
            nav: Number(parseFloat(r.nav || 0)),
          }))
          .sort((a, b) => {
            const [ad, am, ay] = a.date.split("-").map(Number);
            const [bd, bm, by] = b.date.split("-").map(Number);
            return new Date(ay, am - 1, ad) - new Date(by, bm - 1, bd);
          });

        setMeta(m);
        setNavSeries(series);
      } catch (err) {
        toast.error("Market data unavailable" , err);
      } finally {
        setLoading(false);
      }
    };
    fetchFund();
  }, [schemeCode]);

  useEffect(() => {
    if (!inrAmount || navSeries.length === 0) {
      setUnits(0);
      return;
    }
    const latestNav = navSeries[navSeries.length - 1]?.nav || 0;
    setUnits(Number(inrAmount) / latestNav);
  }, [inrAmount, navSeries]);

  if (loading) return (
    <div className="fp-loader">
      <RiLoader4Line className="fp-spin" />
      <span>Analyzing Market Data...</span>
    </div>
  );

  const latest = navSeries[navSeries.length - 1];
  const targetNavValue = Number(targetNav) || 0;
  const projectedReturn = (Number(inrAmount) > 0 && targetNavValue > 0)
    ? ((units * targetNavValue - Number(inrAmount)) / Number(inrAmount)) * 100
    : null;

  return (
    <>
    <div className="fp-root">
      {/* --- HERO HEADER --- */}
      <header className="fp-header">
        <div className="fp-header-left">
          <span className="fp-tag">{meta.scheme_category}</span>
          <h1 className="fp-title">{meta.scheme_name}</h1>
          <p className="fp-subtitle">{meta.fund_house} • {meta.scheme_type}</p>
        </div>
        <div className="fp-nav-hero">
          <span className="fp-nav-label">Current NAV</span>
          <div className="fp-nav-price">₹{latest.nav.toFixed(2)}</div>
          <span className="fp-nav-date">Last updated: {latest.date}</span>
        </div>
      </header>

      <div className="fp-grid">
        {/* --- LEFT: CHART --- */}
        <div className="fp-col-main">
          <div className="fp-card fp-chart-card">
            <div className="fp-card-head">
              <h3><RiPulseLine /> Performance History</h3>
              <div className="fp-chart-legend">
                <span><i className="dot-buy" /> NAV Growth</span>
              </div>
            </div>
            <div className="fp-chart-container">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={navSeries}>
                  <defs>
                    <linearGradient id="navGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(val) => [`₹${val}`, 'NAV']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="nav" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#navGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="fp-card fp-history-card">
            <div className="fp-card-head">
              <h3><RiHistoryLine /> Recent Performance</h3>
            </div>
            <div className="fp-history-list">
              {navSeries.slice(-6).reverse().map((n, i) => (
                <div key={i} className="fp-history-row">
                  <span className="fp-h-date">{n.date}</span>
                  <div className="fp-h-line" />
                  <span className="fp-h-val">₹{n.nav.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT: TOOLS --- */}
        <div className="fp-col-side">
          <div className="fp-card fp-calc-card">
            <div className="fp-card-head">
              <h3><RiCalculatorLine /> Worth Estimator</h3>
            </div>
            <div className="fp-input-group">
              <label>Investment Amount</label>
              <div className="fp-input-wrapper">
                <span className="fp-input-prefix">₹</span>
                <input 
                  type="number" 
                  value={inrAmount} 
                  onChange={(e) => setInrAmount(e.target.value)}
                  placeholder="0.00" 
                />
              </div>
            </div>
            <div className="fp-input-group">
              <label>Projected Future NAV</label>
              <div className="fp-input-wrapper">
                <span className="fp-input-prefix">₹</span>
                <input 
                  type="number" 
                  value={targetNav} 
                  onChange={(e) => setTargetNav(e.target.value)}
                  placeholder={latest.nav.toFixed(2)} 
                />
              </div>
            </div>

            <div className="fp-calc-results">
              <div className="fp-res-row">
                <span>Estimated Units</span>
                <strong>{units.toFixed(4)}</strong>
              </div>
              <div className="fp-res-row">
                <span>Projected Value</span>
                <strong>₹{(units * targetNavValue).toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>
              </div>
              <div className={`fp-res-highlight ${projectedReturn >= 0 ? 'pos' : 'neg'}`}>
                <span>Return Rate</span>
                <div className="fp-res-val">
                  {projectedReturn !== null ? `${projectedReturn.toFixed(2)}%` : '--'}
                </div>
              </div>
            </div>
          </div>

          <div className="fp-card fp-info-card">
            <div className="fp-card-head">
              <h3><RiInformationLine /> Specifications</h3>
            </div>
            <div className="fp-info-list">
              <div className="fp-info-item">
                <label>Fund House</label>
                <p>{meta.fund_house}</p>
              </div>
              <div className="fp-info-item">
                <label>ISIN Growth</label>
                <p>{meta.isin_growth || "N/A"}</p>
              </div>
              <div className="fp-info-item">
                <label>Scheme Code</label>
                <p>{schemeCode}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <NeuroFooter/>
      </>
  );
}

export default FundsPage;