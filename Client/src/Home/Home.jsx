import React from "react";
import "./Home.css";
import PhoneMarket from "../assets/image.png";
import PhoneChart from "../assets/image2.png";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-wrapper">
      <section className="home-hero">
        <div className="home-hero-left">
          <h1 className="home-hero-title">
            Invest for
            <span>the Future</span>
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

      <section className="home-investments">
        <h2 className="home-investments-title">
          Get the Most Out
          <span>of Your Investments</span>
        </h2>

        <div className="home-investment-cards">
          <article className="home-investment-card home-investment-card-accounts">
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

          <article className="home-investment-card home-investment-card-analytics">
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

        <div className="home-advantages">
          <div className="home-advantages-intro">
            <h2>Advantages</h2>
            <p>
              Learn how markets move, test stock strategies with ETH, and build
              confidence before putting real capital at risk
            </p>
          </div>

          <div className="home-advantages-grid">
            <article className="home-advantage-item">
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

            <article className="home-advantage-item">
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

            <article className="home-advantage-item">
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

            <article className="home-advantage-item">
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
    </div>
  );
};

export default Home;
