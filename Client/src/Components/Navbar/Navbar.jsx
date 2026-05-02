import React from "react";
import { Link } from "react-router-dom";
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="home-navbar">
      <Link to="/" className="home-nav-brand">
         <span aria-hidden="true"></span>
        NeuroStock
       
      </Link>

      <ul className="home-nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/Stocks">Stocks</Link></li>
        <li><Link to="/MutualFunds">Mutual Funds</Link></li>
        <li><Link to="/MarketNews">News</Link></li>
        <li><Link to="/Dashboard">Dashboard</Link></li>
      </ul>

      <div className="home-nav-actions">
        <Link to="/Auth" className="home-nav-login">Log In</Link>
        <Link to="/Auth" className="home-nav-download">Explore</Link>
      </div>
    </nav>
  );
};

export default Navbar;
