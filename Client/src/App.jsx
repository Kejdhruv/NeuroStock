import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './Components/Layouts/MainLayout';
import Layout from './Components/Layouts/Layout';
import AuthPage from './User/Authenication/Login'; 
import StocksPage from './Stocks/StockPage/StocksPage'; 
import StockCard from './Stocks/Stocks'; 
import MarketNews from "./News/MarketNews"; 
import Funds from "./MutualFunds/Funds";
import FundsPage from './MutualFunds/FundsPage/FundsPage'; 
import UserDashboard from './Dashboard/User/UserDashhboard'; 
import HoldingsPage from './Dashboard/Holdings/HoldingsPage';
import BoughtHistoryPage from './Dashboard/History/BoughtHistoryPage'; 
import SellHistoryPage from './Dashboard/Selling/SellHistoryPage'; 
import Home from "./Home/Home"
import ProtectedRoute from './User/Authenication/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Auth page without navbar */}
      <Route path="/Auth" element={<AuthPage />} />

      {/* Pages with navbar but no sidebar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home/>} />
        <Route path="/Stocks" element={<StockCard/>} />
        <Route path="/Stock/:ticker" element={<ProtectedRoute><StocksPage /></ProtectedRoute>} />
        <Route path="/MarketNews" element={<MarketNews/>} />
        <Route path="/MutualFunds" element={<Funds />} />
         <Route path="/MutualFunds/:schemeCode" element={ <ProtectedRoute> <FundsPage/> </ProtectedRoute>} />
  </Route> 
        {/* Dashboard with sidebar and navbar */}
        <Route path="/Dashboard" element={  <ProtectedRoute>
        <Layout /> {/* existing layout with navbar/sidebar intact */}
      </ProtectedRoute>}>
          <Route index element={<UserDashboard />} />
          <Route path="holdings" element={<HoldingsPage/>} />
          <Route path="buy-history" element={<BoughtHistoryPage/>} />
          <Route path="sell-history" element={<SellHistoryPage />} />
        </Route>
    
    </Routes>
  );
}

export default App;