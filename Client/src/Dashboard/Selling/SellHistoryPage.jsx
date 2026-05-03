import React, { useEffect, useState } from 'react';
import './SellHistoryPage.css';
import { FaMoneyBillWave, FaExternalLinkAlt } from 'react-icons/fa';
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

const SellHistoryPage = () => {
  const [solds, setSolds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3001/Profile/SoldStocks", { credentials: "include" });
        const data = await res.json();
        const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setSolds(Array.isArray(sorted) ? sorted : []);
      } catch (error) {
        console.error("Error fetching selling history:", error);
        setSolds([]);
      }
    };
    fetchData();
  }, []);

  // 🔥 MOST SOLD
  const stockFreq = solds.reduce((acc, s) => {
    const k = s.Stocksymbol;
    if (!acc[k]) acc[k] = { name: s.Stockname, symbol: k, img: s.stockimage, count: 0, qty: 0, earned: 0 };
    acc[k].count += 1;
    acc[k].qty += s.Quantity;
    acc[k].earned += s.Soldat * s.Quantity;
    return acc;
  }, {});

  const topStocks = Object.values(stockFreq).sort((a, b) => b.count - a.count).slice(0, 5);
  const totalSold = solds.reduce((s, i) => s + i.Soldat * i.Quantity, 0);
  const maxCount = topStocks[0]?.count || 1;

  // 🔥 GRAPH
  const chartData = [...solds]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .reduce((acc, s) => {
      const prev = acc.length ? acc[acc.length - 1].cumulative : 0;
      const val = prev + s.Soldat * s.Quantity;
      acc.push({
        date: new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: s.Soldat,
        cumulative: parseFloat(val.toFixed(2)),
      });
      return acc;
    }, []);

  const avgPrice = solds.length
    ? (solds.reduce((s, i) => s + i.Soldat, 0) / solds.length).toFixed(2)
    : '—';

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="sh-tooltip">
        <span>{label}</span>
        <div><span>Price</span><strong>${payload[0]?.payload?.price}</strong></div>
        <div><span>Total</span><strong>${payload[0]?.value}</strong></div>
      </div>
    );
  };

  return (
    <div className="sh-root">

      <div className="sh-page-title">
        <FaMoneyBillWave className="sh-icon" />
        <span>Selling History</span>
      </div>

      <div className="sh-cards-grid">

        {/* MOST SOLD */}
        <div className="sh-card">
          <div className="sh-card__label">
            <RiBarChartBoxLine /> Most Sold Stocks
          </div>

          {topStocks.map((s) => (
            <div key={s.symbol} className="sh-stocks__row">
              <img src={s.img} alt="" className="sh-stocks__img" />
              <div className="sh-stocks__name">{s.name}</div>

              <div className="sh-stocks__bar-wrap">
                <div className="sh-stocks__bar" style={{ width: `${(s.count / maxCount) * 100}%` }} />
              </div>

              <div className="sh-stocks__meta">
                {s.count}× | ${s.earned.toFixed(0)}
              </div>
            </div>
          ))}

          <div className="sh-total-invest">
            Total Sold: ${totalSold.toFixed(2)}
          </div>
        </div>

        {/* GRAPH */}
        <div className="sh-card sh-chart">
          <div className="sh-card__label">
            <RiLineChartLine /> Sell Timeline
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="shGrad" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#shGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>

         <div className="bh-chart__stats">
  <div className="bh-chart__stat">
    <span>Total Transactions</span>
    <strong>{solds.length}</strong>
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

      {/* TABLE */}
      <div className="sh-table-wrap">
        <div className="sh-table-head">
          <div></div>
          <div>Stock Name</div>
          <div>Symbol</div>
          <div>Quantity</div>
          <div>Sold At</div>
          <div>Buying ID</div>
          <div>Selling ID</div>
          <div>Date</div>
          <div>Tx</div>
        </div>
        {solds.map((item, i) => (
          <div key={i} className="sh-table-row">
            <img src={item.stockimage} alt=""  className='bh-row__img'/>
            <div>{item.Stockname}</div>
            <div>{item.Stocksymbol}</div>
            <div>x{item.Quantity}</div>
            <div>${item.Soldat}</div>
            <div>{item.buyingid}</div>
            <div>{item.sellingid}</div>
            <div>{new Date(item.timestamp).toLocaleString()}</div>

            {item.Transactionid && (
              <a
                href={`https://sepolia.etherscan.io/tx/${item.Transactionid}`}
                target="_blank"
                rel="noreferrer"
                className="sh-etherscan-link"
              >
                 Etherscan <FaExternalLinkAlt style={{ fontSize: '10px', marginLeft: '3px' }} />
              </a>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default SellHistoryPage;