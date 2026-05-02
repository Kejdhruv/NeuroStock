import React, { useEffect } from "react";
import "./Home.css";
import PhoneMarket from "../assets/image.png";
import PhoneChart from "../assets/image2.png";
import PhoneExtra from "../assets/image3.png";
import CardImage from "../assets/image4.png";
import { Link } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-wrapper">
      <section className="home-hero reveal">
        <div className="home-hero-left">
          <h1 className="home-hero-title">
            {"Invest for the Future".split("").map((char, i) => (
              <span
                key={i}
                style={{ "--i": i, whiteSpace: "pre" }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>

          <p className="home-hero-copy">
            Work with all the necessary information and tools to boost money
            flow from your capital investment using NeuroStock.
          </p>

          <div className="home-hero-buttons">
            <Link to="/auth" className="home-btn-primary">
              Start your Future Right Now
            </Link>
          </div>

          <Link to="/MarketNews" className="home-find-more">
            Find Out More
            <span aria-hidden="true">↓</span>
          </Link>
        </div>

        <div className="home-hero-right">
          <div className="home-hero-star" aria-hidden="true">✦</div>
          <svg className="home-hero-arrow" viewBox="0 0 300 300" aria-hidden="true">
            <path d="M52 210 C126 196 196 222 199 257 C201 280 164 276 174 237 C191 171 270 120 238 36" />
            <path d="M53 210 L86 189" />
            <path d="M53 210 L83 229" />
          </svg>

          <div className="home-phone-stage">
            <img
              src={PhoneMarket}
              alt="Market app screen"
              className="home-phone home-phone-market"
            />
            <img
              src={PhoneChart}
              alt="Stock chart app screen"
              className="home-phone home-phone-chart"
            />
          </div>
        </div>
      </section>

      <section className="home-investments reveal">
        <h2 className="home-investments-title">
          Get the Most Out
          <span>of Your Investments</span>
        </h2>

        <div className="home-investment-cards reveal">
          <article className="home-investment-card home-investment-card-accounts reveal">
            <div className="home-card-content">
              <h3>Convert ETH to Stocks</h3>
              <p>Use live ETH value to simulate stock buying power instantly</p>
              <Link to="/Dashboard" className="home-read-more">
                Read More <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="home-card-art home-card-art-accounts" aria-hidden="true">
              <span className="home-art-black"></span>
              <span className="home-art-blue"></span>
              <svg viewBox="0 0 120 90">
                <path d="M31 56 C57 24 101 29 93 58 C86 83 42 77 45 45 C47 23 70 12 84 24" />
                <path d="M31 56 L20 43" />
              </svg>
            </div>
          </article>

          <article className="home-investment-card home-investment-card-analytics reveal">
            <div className="home-card-content">
              <h3>Stocks Simulator and Predictions</h3>
              <p>Practice trades, review price predictions, and test strategies safely</p>
              <Link to="/Stocks" className="home-read-more">
                Read More <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="home-card-art home-card-art-analytics" aria-hidden="true">
              <span className="home-arc home-arc-blue"></span>
              <span className="home-arc home-arc-red"></span>
              <span className="home-arc home-arc-black"></span>
              <svg viewBox="0 0 170 120">
                <path d="M21 75 C38 94 48 41 67 66 C83 88 89 31 108 46 C124 59 133 32 146 25" />
                <path d="M135 23 L146 25 L145 38" />
              </svg>
            </div>
          </article>
        </div>

        <div className="home-advantages reveal">
          <div className="home-advantages-intro">
            <h2>Advantages</h2>
            <p>
              Learn how markets move, test stock strategies with ETH, and build
              confidence before putting real capital at risk
            </p>
          </div>

          <div className="home-advantages-grid">
            <article className="home-advantage-item reveal">
              <div className="home-advantage-icon">↗</div>
              <div>
                <h3>Live ETH Price</h3>
                <p>
                  Your simulator balance follows live ETH pricing, so every
                  stock move starts from real market value
                </p>
                <Link to="/Auth">Open an Account</Link>
              </div>
            </article>

            <article className="home-advantage-item reveal">
              <div className="home-advantage-icon">?</div>
              <div>
                <h3>No Extra Brokerage</h3>
                <p>
                  Convert ETH into simulated stock positions without extra
                  brokerage charges or hidden fees
                </p>
                <Link to="/Stocks">Explore Stocks</Link>
              </div>
            </article>

            <article className="home-advantage-item reveal">
              <div className="home-advantage-icon">◎</div>
              <div>
                <h3>Portfolio Tracking</h3>
                <p>
                  Watch holdings, simulated gains, trade history, and portfolio
                  performance in one clean dashboard
                </p>
                <Link to="/Dashboard">View Portfolio</Link>
              </div>
            </article>

            <article className="home-advantage-item reveal">
              <div className="home-advantage-icon">✓</div>
              <div>
                <h3>Metamask</h3>

                <p>
                  Buy or sell simulated stocks quickly through a verified, safe
                  structure built for learning using{" "}
                  <b style={{ color: "black" }}>MetaMask Wallets</b>.
                </p>

                <a
                  href="https://metamask.io/en-GB"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn Metamask
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* New Section 1 */}
    {/* Section 1 — Banner */}
<section className="home-extra-section reveal">
  <div className="home-extra-container banner-layout">
    <div className="home-extra-banner">
      <div className="home-banner-wave">
        <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
          <path d="M2 30 Q10 10 20 20 Q30 30 40 15 Q50 2 58 10" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
      <h2>Keep Your Finger on the Investment Market Pulse</h2>
      <button className="home-download-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
        Download App
      </button>
    </div>

    <div className="home-extra-stack">
      <img src={PhoneExtra} alt="phone" className="home-extra-phone" />
    </div>
  </div>
</section>

{/* Section 2 — Trade in Real Time */}
<section className="home-extra-section reveal">
  <div className="home-extra-container">
    <div className="home-extra-left">
      <div className="home-mini-card-wrap">
        <div className="home-mini-card-accent"></div>
        <img src={CardImage} alt="mini chart" className="home-mini-card-img" />
      </div>
    </div>

    <div className="home-extra-text">
      <h2>Trade in Real Time</h2>
      <p>
        No more waiting. Your orders are executed immediately, the price of your
        securities is updated every second and NeuroStock always has the most
        relevant information.
      </p>
    </div>
  </div>
</section>
    </div>
  );
};

export default Home;
