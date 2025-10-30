import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './User/Login';
import Home from './Home/Home';
import StockCard from './Stocks/Stocks';
import StocksPage from './Stocks/StocksPage';
import MetalsPage from './Metals/MetalsPage';
import Layout from './User/Layout';
import UserDashhboard from './Dashboard/UserDashhboard'; 
import HoldingsPage from './Dashboard/Holdings/HoldingsPage';
import BoughtHistoryPage from './Dashboard/History/BoughtHistoryPage';
import SellHistoryPage from './Dashboard/Selling/SellHistoryPage';
import MainLayout from './User/MainLayout'; 
import MarketNews from './News/MarketNews';
import Funds from './MutualFunds/Funds';
import FundsPage from './MutualFunds/FundsPage';

function App() {
  return (
    <Routes>
      {/* Auth page without navbar */}
      <Route path="/Auth" element={<AuthPage />} />

      {/* Pages with navbar but no sidebar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/Stocks" element={<StockCard />} />
        <Route path="/Stock/:ticker" element={<StocksPage />} />
        <Route path="/Metals" element={<MetalsPage />} />
        <Route path="/MarketNews" element={<MarketNews />} />
        <Route path="/MutualFunds" element={<Funds />} />
         <Route path="/MutualFunds/:schemeCode" element={<FundsPage/>} />
  </Route> 
        {/* Dashboard with sidebar and navbar */}
        <Route path="/Dashboard/:userid" element={<Layout />}>
          <Route index element={<UserDashhboard />} />
          <Route path="holdings" element={<HoldingsPage />} />
          <Route path="buy-history" element={<BoughtHistoryPage />} />
          <Route path="sell-history" element={<SellHistoryPage />} />
        </Route>
    
    </Routes>
  );
}

export default App;