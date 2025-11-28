import React from "react";
import Navbar from "../Navbar/Navbar.jsx"; // your Navbar component
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default MainLayout;