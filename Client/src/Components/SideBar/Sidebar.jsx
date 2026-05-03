import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Sidebar.css';

import {
  RiDashboardLine,
  RiStackLine,
  RiArrowDownCircleLine,
  RiArrowUpCircleLine,
  RiHome4Line,
  RiLogoutCircleRLine,
} from 'react-icons/ri';

const NAV_ITEMS = [
  { to: '/Dashboard', end: true, icon: <RiDashboardLine />, label: 'Dashboard' },
  { to: '/',                       end: false, icon: <RiHome4Line />,           label: 'Home'         },
  { to: '/Dashboard/holdings',     end: false, icon: <RiStackLine />,           label: 'Holdings'     },
  { to: '/Dashboard/buy-history',  end: false, icon: <RiArrowDownCircleLine />, label: 'Buy History'  },
  { to: '/Dashboard/sell-history', end: false, icon: <RiArrowUpCircleLine />,   label: 'Sell History' },

];

const Sidebar = () => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await fetch('http://localhost:3001/Auth/Logout', {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Logged out!');
        setTimeout(() => navigate('/'), 1000);
      } else {
        toast.error(data.message || 'Logout failed');
      }
    } catch (err) {
      toast.error('Server error during logout' , err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <ToastContainer theme="dark" position="bottom-left" />

      <aside className="sb-root">
        {/* Glow orbs — purely decorative */}
        <span className="sb-glow sb-glow--top" aria-hidden="true" />
        <span className="sb-glow sb-glow--bot" aria-hidden="true" />

        {/* ── BRAND MARK ──────────────────────────── */}
        <div className="sb-brand" aria-hidden="true">
          <span className="sb-brand__dot" />
          <span className="sb-brand__dot sb-brand__dot--2" />
        </div>

        {/* ── NAV ─────────────────────────────────── */}
        <nav className="sb-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, end, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sb-nav__link${isActive ? ' sb-nav__link--active' : ''}`
              }
            >
              <span className="sb-nav__icon">{icon}</span>
              <span className="sb-nav__label">{label}</span>
              <span className="sb-nav__indicator" aria-hidden="true" />
            </NavLink>
          ))}
        </nav>

        {/* ── LOGOUT ──────────────────────────────── */}
        <button
          className={`sb-logout${loggingOut ? ' sb-logout--busy' : ''}`}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <RiLogoutCircleRLine className="sb-logout__icon" />
          <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;