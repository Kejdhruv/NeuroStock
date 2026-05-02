import React from "react";
import "./footer.css";

const NeuroFooter = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-layout">

          {/* LEFT */}
          <div className="footer-left">

            <div className="footer-grid">
              <div>
                <h4>// Platform</h4>
                <ul>
                  <li>Dashboard</li>
                  <li>Stock Simulator</li>
                  <li>ETH Conversion</li>
                  <li>Portfolio</li>
                  <li>Market Data</li>
                </ul>
              </div>

              <div>
                <h4>// Features</h4>
                <ul>
                  <li>Live Prices</li>
                  <li>Predictions</li>
                  <li>Trading History</li>
                  <li>Analytics</li>
                  <li>Performance</li>
                </ul>
              </div>

              <div>
                <h4>// Web3</h4>
                <ul>
                  <li>MetaMask</li>
                  <li>Smart Contracts</li>
                  <li>Blockchain</li>
                  <li>Transactions</li>
                  <li>Security</li>
                </ul>
              </div>

              <div>
                <h4>// Company</h4>
                <ul>
                  <li>About NeuroStock</li>
                  <li>Blog</li>
                  <li>Careers</li>
                  <li>Contact</li>
                </ul>
              </div>
            </div>

            <div className="footer-line"></div>

            {/* Newsletter */}
            <div className="footer-news">
              <h3>Stay Updated</h3>
              <p>
                Get latest market insights, stock trends and platform updates.
              </p>

              <div className="footer-subscribe">
                <input type="email" placeholder="Enter your email" />
                <button>Join</button>
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="footer-form-box">
            <h4>// Contact</h4>
            <p>Have questions about trading or Web3 integration?</p>

            <form>
              <input type="text" placeholder="Your Name" />
              <input type="email" placeholder="Your Email" />
              <textarea placeholder="Your Message"></textarea>
              <button type="submit">Send Message</button>
            </form>
          </div>

        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>©2026 NeuroStock. All rights reserved.</p>
          <div>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default NeuroFooter;