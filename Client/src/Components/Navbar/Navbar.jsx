import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import './Navbar.css'

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const handleAuthClick = () => {
    if (isLoggedIn) {
      navigate("/Dashboard");
    } else {
      navigate("/Auth");
    }
  };

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
        <li><Link to="/MarketNews">Market News</Link></li>
      </ul>

      <div className="home-nav-actions">
        {isLoggedIn ? (
          <button className="home-nav-login" onClick={handleAuthClick}>
           <FaUser style={{ marginRight: "6px" }} />
            Profile
          </button>
        ) : (
          <button className="home-nav-login" onClick={handleAuthClick}>
            Login
          </button>
        )}

        <Link to="/Auth" className="home-nav-download">Explore</Link>
      </div>
    </nav>
  );
};

export default Navbar;
