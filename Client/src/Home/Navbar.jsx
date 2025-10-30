import React from "react";
import { Link } from "react-router-dom";
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="home-navbar">
      <ul className="home-nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/Stocks">Stocks</Link></li>
        <li><Link to="/Mutualfunds">Mutual Funds</Link></li>
        <li><Link to="/MarketNews">News</Link></li>
        <li><Link to="/Dashboard">Dashboard</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;