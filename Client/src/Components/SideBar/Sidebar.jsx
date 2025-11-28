import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Sidebar.css';
import Avatar1 from "../../assets/Ballerina.png" 
import Avatar2 from "../../assets/Brian.png" 
import Avatar3 from "../../assets/Camila.png" 
import Avatar4 from "../../assets/John.png"
import Avatar5 from "../../assets/Lucia.png" 
import Avatar6 from "../../assets/Roony.png" 
const Sidebar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const avatars = [
  Avatar1 , Avatar2 , Avatar3 , Avatar4 , Avatar5 , Avatar6 
];

const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
  useEffect(() => {
  const fetchUserFromToken = async () => {
    try {
      const res = await fetch("http://localhost:3001/Auth/Me", {
        credentials: "include", // ✅ send cookie automatically
      });
      const data = await res.json();

      if (!data.loggedIn) {
        toast.error("User not logged in!");
        navigate("/");
        return;
      }
      setUser(data.user);
    } catch (err) {
      toast.error("Failed to authenticate user");
      console.error("Auth error:", err);
    }
  };

  fetchUserFromToken();
}, [navigate]); 

 const handleLogout = async () => {
  try {
    const res = await fetch("http://localhost:3001/Auth/Logout", {
      credentials: "include"
    });

    const data = await res.json();

    if (res.ok && data.success) {
      toast.success("Logged out!");
      setTimeout(() => navigate("/"), 1000);
    } else {
      toast.error(data.message || "Logout failed");
    }

  } catch (err) {
    console.error("Logout error:", err);
    toast.error("Server error during logout");
  }
};
  return (
    <div className="sidebar">
      <ToastContainer />
      <div className="user-profile">
        <img src={randomAvatar} alt="User" className="user-avatar" />
        {user && (
          <>
            <h3>{user.firstName} {user.lastName}</h3>
            <h6 className='email'>{user.email}</h6>
          </>
        )}
      </div>

      <nav className="nav-menu">
        <NavLink to={`/Dashboard`} end className={({ isActive }) => isActive ? 'active' : ''}>
          Dashboard
        </NavLink>
        <NavLink to={`/Dashboard/holdings`} className={({ isActive }) => isActive ? 'active' : ''}>
          Holdings
        </NavLink>
        <NavLink to={`/Dashboard/buy-history`} className={({ isActive }) => isActive ? 'active' : ''}>
          Buy History
        </NavLink>
        <NavLink to={`/Dashboard/sell-history`} className={({ isActive }) => isActive ? 'active' : ''}>
          Sell History
        </NavLink>
         <NavLink to={`/`} className={({ isActive }) => isActive ? 'active' : ''}>
          Back to Home
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;