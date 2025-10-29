// MutualFundsPage.jsx
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
import "./FundsPage.css"; // adapt from your StocksPage.css or theme
import { ethers } from "ethers";
import MutualABI from "../abi/GoldABI.json"; // placeholder ABI filename
import { toast } from "react-hot-toast";
import StockLoader from "../Dashboard/StockLoader";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_FUNDS_ADDRESS;

function FundsPage() {
  const { schemeCode } = useParams(); // route param (optional)
  const [meta, setMeta] = useState(null);
  const [navSeries, setNavSeries] = useState([]); // array of { date, nav: number }
  const [ethPriceINR, setEthPriceINR] = useState(null);
  const [account, setAccount] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [inrAmount, setInrAmount] = useState("");
  const [units, setUnits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [useremail, setUseremail] = useState("");
  const [counter, setCounter] = useState(0);

  // load user info from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) setUserId(storedId);
    const email = localStorage.getItem("userEmail");
    if (email) setUseremail(email || "");
  }, []);

  // fetch user email from backend if userId exists
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:3001/Profile/${userId}`);
        const data = await res.json();
        if (data[0]?.email) setUseremail(data[0].email);
      } catch (err) {
        console.error("Failed to fetch profile email", err);
      }
    })();
  }, [userId]);

  // fetch counter
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3001/Counter/buyingId");
        const d = await res.json();
        if (d && d[0] && typeof d[0].value !== "undefined") setCounter(d[0].value);
      } catch (err) {
        console.error("Failed to fetch counter", err);
      }
    })();
  }, []);

  // fetch mutual fund JSON (dummy endpoint); replace endpoint as needed
 useEffect(() => {
  const code = schemeCode || "118945"; // fallback to sample code

  const fetchFund = async () => {
    setLoading(true); // 🟢 mark as loading before fetch starts
    try {
      const res = await fetch(`https://api.mfapi.in/mf/${code}`);
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
      setLoading(false); // 🟢 ensures loading ends always
    }
  };

  fetchFund();
}, [schemeCode]);

  const getEthInINR = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr"
      );
      const data = await res.json();
      setEthPriceINR(data.ethereum.inr);
    } catch (err) {
      console.error("Failed to fetch ETH price (INR)", err);
    }
  };

  useEffect(() => {
    getEthInINR();
  }, []);


  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not detected");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      toast.success("Wallet connected");
    } catch (err) {
      console.error("Wallet connect error:", err);
      toast.error("Wallet connection failed");
    }
  };

  // compute units whenever INR amount or NAV changes
  useEffect(() => {
    if (!inrAmount || inrAmount === "" || navSeries.length === 0) {
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

  // buys: send transaction to contract and record to backend
  const buyMutualFund = async () => {
    if (!window.ethereum) {
      toast.error("Install MetaMask");
      return;
    }
    if (!account) {
      await connectWallet();
      if (!account) {
        toast.error("Wallet required");
        return;
      }
    }

    const latestNav = navSeries[navSeries.length - 1]?.nav || 0;
    if (!latestNav || latestNav <= 0) {
      toast.error("Invalid NAV");
      return;
    }

    const inr = Number(inrAmount);
    if (!inr || inr <= 0) {
      toast.error("Enter a valid INR amount");
      return;
    }

    if (!ethPriceINR) {
      toast.error("ETH price not available");
      return;
    }

    try {
      setLoading(true);

      // approximate ETH amount required (INR -> ETH)
      // ethNeeded = inr / ethPriceINR
      const ethNeeded = inr / ethPriceINR; // decimal
      // convert ETH decimal to Wei
      const valueWei = ethers.parseUnits(ethNeeded.toString(), 18); // BigInt

      // create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MutualABI, signer);

      // Call the contract method; adjust args based on your contract ABI
      // I use: buyMutualFund(schemeCodeOrName, unitsInRayOrScaled, buyingId, { value: valueWei })
      // Because units are fractional, many contracts expect scaled integer units - adapt as needed.
      const unitsScaled = BigInt(Math.floor(units * 1e6)); // example scaling (1e6) - change to your contract's scale
      const schemeName = meta?.scheme_name || meta?.scheme_name || `Scheme-${schemeCode || "unknown"}`;

      // Example contract call - replace with your real method and arguments
      const tx = await contract.buyMutualFund(
        schemeName,
        unitsScaled,
        BigInt(counter),
        { value: valueWei }
      );

      console.log("Tx submitted:", tx.hash);
      toast.success("Transaction submitted");

      const receipt = await tx.wait();
      console.log("Tx confirmed", receipt);

      // Prepare data to post to backend
      const BoughtData = {
        Userid: userId || "guest",
        Email: useremail || "",
        FundName: meta?.scheme_name || "",
        SchemeCode: meta?.scheme_code || schemeCode || "",
        NAV: latestNav,
        INRAmount: inr,
        Units: units,
        timestamp: new Date().toISOString(),
        Transactionid: tx.hash,
        buyingid: counter,
        accountid: account || "",
      };

      // post to holdings and buying endpoints (dummy)
      const res1 = await fetch("http://localhost:3001/FundsHoldings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(BoughtData),
      });
      const res2 = await fetch("http://localhost:3001/FundsBuying", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(BoughtData),
      });

      if (res1.ok && res2.ok) {
        toast.success("Purchase recorded");
      } else {
        const j1 = await res1.json().catch(() => ({}));
        const j2 = await res2.json().catch(() => ({}));
        console.warn("Save responses", j1, j2);
        toast.error("Failed to persist purchase to backend");
      }

      await fetch("http://localhost:3001/Counter/buyingId", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: counter + 1 }),
      });

      setCounter((c) => c + 1);
      setModalOpen(false);
    } catch (err) {
      console.error("Buy error:", err);
      toast.error("Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  // rendering helpers
  const latestNav = navSeries.length ? navSeries[navSeries.length - 1].nav : null;
  const navDisplay = latestNav ? latestNav.toFixed(5) : "N/A";

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

              <div className="buy-controls">
                <button onClick={connectWallet} className="connect-btn">
                  {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
                </button>
                <button onClick={() => setModalOpen(true)} className="buy-btn">
                  Buy
                </button>
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
            <h3>Buy Calculator</h3>
            <label>
              Enter INR amount:
              <input
                type="number"
                min="1"
                value={inrAmount}
                onChange={(e) => setInrAmount(e.target.value)}
                placeholder="e.g. 10000"
              />
            </label>

            <div className="calc-rows">
              <div><strong>Latest NAV:</strong> ₹ {navDisplay}</div>
              <div><strong>Estimated Units:</strong> {units ? units.toFixed(5) : "0.00000"}</div>
              <div><strong>ETH needed (approx):</strong> {ethPriceINR ? (Number(inrAmount) / ethPriceINR).toFixed(6) : "N/A"}</div>
            </div>

            <div className="calc-buttons">
              <button onClick={() => {
                if (!inrAmount || Number(inrAmount) <= 0) {
                  toast.error("Enter amount");
                  return;
                }
                setModalOpen(true);
              }} className="proceed-btn">Proceed to Buy</button>
            </div>
          </div>

        </div>
      </div>

      {/* Buy Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirm Purchase</h2>
            <p><strong>Fund:</strong> {meta.scheme_name}</p>
            <p><strong>INR Amount:</strong> ₹ {Number(inrAmount).toFixed(2)}</p>
            <p><strong>Estimated Units:</strong> {units ? units.toFixed(6) : "0.000000"}</p>
            <p><strong>ETH to send (approx):</strong> {ethPriceINR ? (Number(inrAmount) / ethPriceINR).toFixed(6) : "N/A"}</p>

            <div className="modal-buttons">
              <button onClick={buyMutualFund} className="confirm-btn">Confirm & Send</button>
              <button onClick={() => setModalOpen(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading && <StockLoader />}
    </div>
  );
}

export default FundsPage;