import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./FundsPage.css";
import { toast } from "react-hot-toast";
import StockLoader from "../../Components/Loaders/StockLoader";

function FundsPage() {
  const { schemeCode } = useParams();
  const [meta, setMeta] = useState(null);
  const [navSeries, setNavSeries] = useState([]);
  const [inrAmount, setInrAmount] = useState("");
  const [targetNav, setTargetNav] = useState("");
  const [units, setUnits] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFund = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
        const json = await res.json();

        const m = json.meta || json?.Meta || null;
        const raw = json.data || [];

        const series = raw
          .map((r) => ({
            date: r.date,
            nav: Number(parseFloat(r.nav || r.NAV || 0)),
          }))
          .sort((a, b) => {
            const [ad, am, ay] = a.date.split("-").map(Number);
            const [bd, bm, by] = b.date.split("-").map(Number);
            return new Date(ay, am - 1, ad) - new Date(by, bm - 1, bd);
          });

        setMeta(m);
        setNavSeries(series);
      } catch (err) {
        console.error("Failed to fetch mutual fund data:", err);
        toast.error("Could not fetch fund data");
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
    const parsed = Number(inrAmount);
    if (isNaN(parsed) || parsed <= 0 || latestNav <= 0) {
      setUnits(0);
      return;
    }
    const computedUnits = parsed / latestNav;
    setUnits(computedUnits);
  }, [inrAmount, navSeries]);

  const latestNav = navSeries.length ? navSeries[navSeries.length - 1].nav : null;
  const navDisplay = latestNav ? latestNav.toFixed(5) : "N/A";
  const enteredAmount = Number(inrAmount) || 0;
  const targetNavValue = Number(targetNav) || 0;
  const estimatedCurrentValue = units && latestNav ? units * latestNav : 0;
  const projectedValue = units && targetNavValue > 0 ? units * targetNavValue : 0;
  const projectedReturn =
    enteredAmount > 0 && projectedValue > 0
      ? ((projectedValue - enteredAmount) / enteredAmount) * 100
      : null;

  if (!meta || navSeries.length === 0) {
    return (
      <div className="loader-container">
        <div className="emoji-loader">
          <span>💼</span>
          <span>➡️</span>
          <span>📈</span>
          <span>➡️</span>
          <span>💳</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mutual-dashboard">

      <div className="mutual-body">
        <div className="left-col">
          <div className="nav-card">
            <div className="nav-top">
              <div>
                <h3>Latest NAV</h3>
                <div className="nav-value">₹ {navDisplay}</div>
                <div className="nav-date">
                  {navSeries[navSeries.length - 1].date}
                </div>
              </div>

              <div className="fund-status">
                View-only
              </div>
            </div>

            <div className="chart-visual">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={navSeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip formatter={(val) => `₹ ${val}`} />
                  <Legend />
                  <Line type="monotone" dataKey="nav" dot={false} stroke="#0b1e3f" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* list recent NAVs */}
          <div className="recent-navs">
            <h4>Recent NAVs</h4>
            <ul>
              {navSeries.slice(-5).reverse().map((n) => (
                <li key={n.date}>
                  <span>{n.date}</span>
                  <span>₹ {n.nav.toFixed(5)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="right-col">
          <div className="fund-info-card">
            <h3>Fund Details</h3>
            <ul>
              <li><strong>Fund House:</strong> {meta.fund_house}</li>
              <li><strong>Scheme Type:</strong> {meta.scheme_type}</li>
              <li><strong>Category:</strong> {meta.scheme_category}</li>
              <li><strong>ISIN (Growth):</strong> {meta.isin_growth || "N/A"}</li>
              <li><strong>ISIN (Div Reinv.):</strong> {meta.isin_div_reinvestment || "N/A"}</li>
            </ul>
          </div>

          <div className="calculator-card">
            <h3>Worth Calculator</h3>
            <label>
              Investment amount:
              <input
                type="number"
                min="1"
                value={inrAmount}
                onChange={(e) => setInrAmount(e.target.value)}
                placeholder="e.g. 10000"
              />
            </label>
            <label>
              Future NAV:
              <input
                type="number"
                min="1"
                value={targetNav}
                onChange={(e) => setTargetNav(e.target.value)}
                placeholder={latestNav ? `e.g. ${(latestNav * 1.1).toFixed(2)}` : "e.g. 125.50"}
              />
            </label>

            <div className="calc-rows">
              <div><strong>Latest NAV:</strong> ₹ {navDisplay}</div>
              <div><strong>Estimated Units:</strong> {units ? units.toFixed(5) : "0.00000"}</div>
              <div><strong>Current Worth:</strong> ₹ {estimatedCurrentValue ? estimatedCurrentValue.toFixed(2) : "0.00"}</div>
              <div><strong>Projected Worth:</strong> ₹ {projectedValue ? projectedValue.toFixed(2) : "0.00"}</div>
              <div>
                <strong>Projected Return:</strong>{" "}
                {projectedReturn === null ? "N/A" : `${projectedReturn.toFixed(2)}%`}
              </div>
            </div>
          </div>

        </div>
      </div>

      {loading && <StockLoader />}
    </div>
  );
}

export default FundsPage;
