import React, { useEffect, useState } from 'react';
import './BoughtHistory.css';
import { FaShoppingCart, FaExternalLinkAlt } from 'react-icons/fa';
import { RiBarChartBoxLine, RiLineChartLine } from 'react-icons/ri';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const BoughtHistoryPage = () => {
  const [boughts, setBoughts] = useState([]);

  // ── Original fetch — untouched ────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3001/Profile/Boughts", { credentials: "include" });
        const data = await res.json();
        const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setBoughts(Array.isArray(sorted) ? sorted : []);
      } catch (error) {
        console.error("Error fetching selling history:", error);
        setBoughts([]);
      }
    };
    fetchData();
  }, []);

  // ── Derived — read-only, no state mutation ────────────────

  // Card 1: most-bought stocks
  const stockFreq = boughts.reduce((acc, b) => {
    const k = b.Stocksymbol;
    if (!acc[k]) acc[k] = { name: b.Stockname, symbol: k, img: b.stockimage, count: 0, qty: 0, spent: 0 };
    acc[k].count += 1;
    acc[k].qty += b.Quantity;
    acc[k].spent += b.Boughtat * b.Quantity;
    return acc;
  }, {});
  const topStocks = Object.values(stockFreq).sort((a, b) => b.count - a.count).slice(0, 5);
  const totalInvestment = boughts.reduce((s, b) => s + b.Boughtat * b.Quantity, 0);
  const maxCount = topStocks[0]?.count || 1;

  // Card 2: timeline chart — cumulative investment over time
  const chartData = [...boughts]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .reduce((acc, b) => {
      const prev = acc.length ? acc[acc.length - 1].cumulative : 0;
      const val = prev + b.Boughtat * b.Quantity;
      acc.push({
        date: new Date(b.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: b.Boughtat,
        cumulative: parseFloat(val.toFixed(2)),
      });
      return acc;
    }, []);

  const avgPrice = boughts.length
    ? (boughts.reduce((s, b) => s + b.Boughtat, 0) / boughts.length).toFixed(2)
    : '—';

  // Custom tooltip
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bh-tooltip">
        <span className="bh-tooltip__date">{label}</span>
        <div className="bh-tooltip__row">
          <span>Price</span><strong>${payload[0]?.payload?.price}</strong>
        </div>
        <div className="bh-tooltip__row">
          <span>Total</span><strong>${payload[0]?.value?.toLocaleString()}</strong>
        </div>
      </div>
    );
  };

  return (
    <div className="bh-root">

      {/* ── PAGE TITLE ───────────────────────────────────── */}
      <div className="bh-page-title">
        <FaShoppingCart className="bh-page-title__icon" />
        <span>Buying History</span>
      </div>

      {/* ── 2 TOP CARDS ─────────────────────────────────── */}
      <div className="bh-cards-grid">

        {/* Card 1 — Most Bought + Total Investment */}
        <div className="bh-card bh-card--stocks">
          <div className="bh-card__label">
            <RiBarChartBoxLine className="bh-card__label-icon" />
            Most Purchased Stocks
          </div>

          <div className="bh-stocks__list">
            {topStocks.length === 0 && (
              <p className="bh-card__empty">No data yet</p>
            )}
            {topStocks.map((s) => (
              <div key={s.symbol} className="bh-stocks__row">
                <img src={s.img} alt={s.name} className="bh-stocks__img" />
                <div className="bh-stocks__info">
                  <span className="bh-stocks__name">{s.name}</span>
                 
                </div>
                <div className="bh-stocks__bar-wrap">
                  <div
                    className="bh-stocks__bar"
                    style={{ width: `${(s.count / maxCount) * 100}%` }}
                  />
                </div>
                <div className="bh-stocks__meta">
                  <span className="bh-stocks__count">{s.count}×</span>
                  <span className="bh-stocks__spent">${s.spent.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bh-total-invest">
            <div className="bh-total-invest__label">Total Invested</div>
            <div className="bh-total-invest__value">${totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Card 2 — Timeline Graph + Avg Price */}
        <div className="bh-card bh-card--chart">
          <div className="bh-card__header-row">
            <div className="bh-card__label">
              <RiLineChartLine className="bh-card__label-icon" />
              Cumulative Investment Timeline
            </div>
            <div className="bh-chart__avg">
             
            </div>
          </div>

          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bhGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#edf2f7" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                  width={52}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#bhGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="bh-chart__empty">Not enough data to render chart</div>
          )}

          <div className="bh-chart__stats">
            <div className="bh-chart__stat">
              <span>Total Transactions</span>
              <strong>{boughts.length}</strong>
            </div>
            <div className="bh-chart__divider" />
            <div className="bh-chart__stat">
              <span>Unique Stocks</span>
              <strong>{Object.keys(stockFreq).length}</strong>
            </div>
            <div className="bh-chart__divider" />
            <div className="bh-chart__stat">
              <span>Avg Price</span>
              <strong>${avgPrice}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* ── BUY HISTORY TABLE ────────────────────────────── */}
      <div className="bh-table-wrap">
        <div className="bh-table-head">
          <div></div>
          <div>Stock Name</div>
          <div>Symbol</div>
          <div>Quantity</div>
          <div>Bought At</div>
          <div>Buying ID</div>
          <div>Date</div>
          <div>Tx</div>
        </div>

        {boughts.map((item, index) => (
          <div
            key={index}
            className="bh-table-row"
            style={{ animationDelay: `${index * 35}ms` }}
          >
            <img src={item.stockimage} alt={item.Stockname} className="bh-row__img" />
            <div className="bh-row__name">{item.Stockname}</div>
            <div className="bh-row__symbol">{item.Stocksymbol}</div>
            <div className="bh-row__meta">×{item.Quantity}</div>
            <div className="bh-row__meta">${item.Boughtat}</div>
            <div className="bh-row__id">{item.buyingid}</div>
            <div className="bh-row__date">{new Date(item.timestamp).toLocaleString()}</div>
            <div>
              {item.Transactionid ? (
                <a
                  href={`https://sepolia.etherscan.io/tx/${item.Transactionid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bh-etherscan-link"
                >
                  Etherscan <FaExternalLinkAlt style={{ fontSize: '10px', marginLeft: '3px' }} />
                </a>
              ) : (
                <span className="bh-row__no-tx">—</span>
              )}
            </div>
          </div>
        ))}

        {boughts.length === 0 && (
          <div className="bh-table-empty">No buy history found.</div>
        )}
      </div>
    </div>
  );
};

export default BoughtHistoryPage;