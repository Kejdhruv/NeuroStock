import React from 'react';
import Sidebar from '../Dashboard/Sidebar';
import { Outlet } from 'react-router-dom';
import './Layout.css'; // optional

const Layout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;