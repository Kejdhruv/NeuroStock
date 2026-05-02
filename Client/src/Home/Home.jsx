import React, { useEffect } from "react";
import "./Home.css";
import SideImage3 from "../assets/undraw_metrics_5v8d.svg";
import PhoneMarket from "../assets/image.png";
import PhoneChart from "../assets/image2.png";
import { Link } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    const cards = document.querySelectorAll(".home-feature-card, .home-secondary");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
        }
      });
    }, { threshold: 0.3 });
    cards.forEach(card => observer.observe(card));
  }, []);

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
              Download App
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

      {/* Feature Cards */}
      <section className="home-features">
        <div className="home-feature-card">
          <div className="home-feature-title">Real-Time Market Simulation</div>
          <div className="home-feature-text">
            Practice trading cryptocurrencies like Bitcoin and Ethereum with virtual funds...
          </div>
        </div>
        <div className="home-feature-card">
          <div className="home-feature-title">Virtual Portfolio Tracking</div>
          <div className="home-feature-text">
            Track your virtual portfolio's performance in real-time. Use detailed analytics...
          </div>
        </div>
        <div className="home-feature-card">
          <div className="home-feature-title">Your Financial Intelligence Hub</div>
          <div className="home-feature-text">
            Access live news on bank transactions, gold, and mutual funds. Our AI-based modeling...
          </div>
        </div>
      </section>

      {/* Secondary Section */}
    <section className="home-secondary">
  <div className="home-secondary-left">
    <img src={SideImage3} alt="Analytics" className="home-secondary-image" />
  </div>

  <div className="home-secondary-right">
    <div className="home-secondary-title">
      Integrating Crypto into Your Financial Plan
    </div>
    <div className="home-secondary-text">
      Integrate crypto as the high-risk portion of your portfolio. Allocate a small percentage...
    </div>

    <div className="home-secondary-buttons">
                         <Link to="/MarketNews" className="home-btn-primary">Market News</Link>
                      <Link to="/Stocks" className="home-btn-secondary">Stocks</Link>
    </div>
  </div>
</section>
      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-links">
          <span>About</span>
          <span>Contact</span>
          <span>FAQ</span>
          <span>Terms</span>
          <span>Privacy</span>
        </div>
        <div className="home-footer-text">© 2025 Neurostock. All rights reserved.</div>
      </footer>

    </div>
  );
};

export default Home;
