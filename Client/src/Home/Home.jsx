import React, { useEffect } from "react";
import "./Home.css";
import SideImage from "../assets/new imabe.webp";
import SideImage3 from "../assets/undraw_metrics_5v8d.svg";
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
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-bg"></div>
        <div className="home-hero-left">
          <div className="home-hero-title">
            <span>Master the Market, </span>
            <span>Not Just the Theory.</span>
          </div>
          <div className="home-hero-quote">
            "Risk comes from not knowing what you're doing." — Warren Buffett
          </div>
          <div className="home-hero-buttons">
            <button className="home-btn-primary">Get Started</button>
          <Link to="/auth" className="home-btn-secondary">
  Already have an account? Login
</Link>
          </div>
        </div>
        <div className="home-hero-right">
          <img src={SideImage} alt="Hero" className="home-hero-image" />
        </div>
        {/* Floating icons */}
        <div className="floating-icons">
          <span className="icon btc">₿</span>
          <span className="icon eth">Ξ</span>
          <span className="icon dollar">$</span>
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
                         <Link to="/News" className="home-btn-primary">Market News</Link>
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