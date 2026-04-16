# NeuroStock Frontend

This frontend is the React application for NeuroStock. It handles market discovery, authentication UI, protected portfolio views, blockchain transaction initiation through MetaMask, chart rendering, and interaction with both the Express backend and external market-data providers.

The app is built with Vite and React, and it acts as the main user-facing layer of the full NeuroStock system.

## Stack

- React 19
- Vite
- React Router
- Ethers.js
- Recharts
- React Icons
- React Toastify
- React Hot Toast
- CSS files organized by feature

## What The Frontend Does

The client is responsible for:

- rendering public pages like the landing page, stocks list, mutual funds list, and market news
- presenting login and signup flows
- guarding protected routes using the backend auth cookie
- fetching live stock, news, crypto, and fund data from external APIs
- connecting to MetaMask
- calling deployed Ethereum contracts using ABI files
- sending confirmed transaction metadata to the backend for persistence
- displaying holdings and transaction history through dashboard views
- rendering stock charts and ML prediction results

## App Entry

Main entry file:

- [src/main.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/main.jsx)

What it does:

- mounts the React app into `#root`
- wraps the application in `BrowserRouter`
- enables route-based navigation for the whole frontend

App route definition:

- [src/App.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/App.jsx)

## Frontend Architecture

The app uses two major layout shells:

### 1. Public shell with navbar

File:

- [src/Components/Layouts/MainLayout.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Components/Layouts/MainLayout.jsx)

Used for:

- home page
- stocks list
- stock detail page
- market news
- mutual fund list
- mutual fund detail page

This shell renders:

- the top navigation bar
- the active route page beneath it

### 2. Dashboard shell with sidebar

File:

- [src/Components/Layouts/Layout.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Components/Layouts/Layout.jsx)

Used for:

- dashboard summary
- holdings page
- buy history page
- sell history page

This shell renders:

- the sidebar with user info and navigation
- the active dashboard view

## Route Map

The route map is defined in [src/App.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/App.jsx).

| Route | Page | Protection |
| --- | --- | --- |
| `/` | Landing page | Public |
| `/Auth` | Login / signup page | Public |
| `/Stocks` | Stock list | Public |
| `/Stock/:ticker` | Stock detail page | Protected |
| `/MarketNews` | Market news | Public |
| `/MutualFunds` | Mutual fund list | Public |
| `/MutualFunds/:schemeCode` | Mutual fund detail page | Protected |
| `/Dashboard` | Dashboard summary | Protected |
| `/Dashboard/holdings` | Holdings management | Protected |
| `/Dashboard/buy-history` | Stock buy history | Protected |
| `/Dashboard/sell-history` | Stock sell history | Protected |

## Protected Route Flow

Protected route logic lives in:

- [src/User/Authenication/ProtectedRoute.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/User/Authenication/ProtectedRoute.jsx)

How it works:

- on mount, the component calls `http://localhost:3001/Auth/Me`
- cookies are sent with `credentials: "include"`
- if the backend confirms `loggedIn`, the page renders
- otherwise, the user is redirected away

This means the frontend depends on:

- a valid backend auth cookie named `token`
- the backend being available at `http://localhost:3001`
- CORS and credentials being configured correctly

## Key Feature Areas

### Landing page

File:

- [src/Home/Home.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Home/Home.jsx)

Responsibilities:

- renders the hero section and marketing copy
- uses static assets for visual presentation
- links users toward login, market news, and stocks pages
- triggers simple reveal animations using `IntersectionObserver`

### Navbar

File:

- [src/Components/Navbar/Navbar.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Components/Navbar/Navbar.jsx)

Responsibilities:

- exposes the main navigation for public pages
- links to home, stocks, mutual funds, market news, and dashboard

### Authentication screen

File:

- [src/User/Authenication/Login.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/User/Authenication/Login.jsx)

Responsibilities:

- toggles between signup and login modes
- validates form fields on the client
- sends requests to:
  - `POST /Auth/Signup`
  - `POST /Auth/Login`
- includes cookies in requests
- redirects to `/Dashboard` after successful auth

### Sidebar and dashboard navigation

File:

- [src/Components/SideBar/Sidebar.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Components/SideBar/Sidebar.jsx)

Responsibilities:

- fetches the logged-in user from `GET /Auth/Me`
- displays a random avatar from local assets
- provides links for dashboard sub-pages
- calls `GET /Auth/Logout` on logout

### Dashboard summary

File:

- [src/Dashboard/User/UserDashhboard.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Dashboard/User/UserDashhboard.jsx)

Responsibilities:

- fetches:
  - holdings
  - stock buy history
  - stock sell history
- calculates totals client-side
- shows recent combined activity

### Holdings page

File:

- [src/Dashboard/Holdings/HoldingsPage.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Dashboard/Holdings/HoldingsPage.jsx)

Responsibilities:

- fetches current holdings from the backend
- fetches the current `sellingId` counter
- connects to MetaMask
- fetches ETH/USD conversion with CoinGecko
- fetches a live stock quote before selling
- submits on-chain sell transactions using the `Stocks` contract
- posts confirmed sells to the backend
- updates or deletes holdings records after a completed sell

### Buy history page

File:

- [src/Dashboard/History/BoughtHistoryPage.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Dashboard/History/BoughtHistoryPage.jsx)

Responsibilities:

- fetches stock buy history
- sorts results by timestamp
- renders Etherscan transaction links for each row

### Sell history page

File:

- [src/Dashboard/Selling/SellHistoryPage.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Dashboard/Selling/SellHistoryPage.jsx)

Responsibilities:

- fetches stock sell history
- sorts results by timestamp
- renders Etherscan transaction links

### Stocks list

File:

- [src/Stocks/Stocks.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Stocks/Stocks.jsx)

Responsibilities:

- shows a curated list of stock tickers
- fetches company profile data from Finnhub
- routes users to `/Stock/:ticker`

### Stock detail page

File:

- [src/Stocks/StockPage/StocksPage.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Stocks/StockPage/StocksPage.jsx)

This is one of the most important screens in the frontend.

Responsibilities:

- reads the ticker from the route
- fetches:
  - stock profile from Finnhub
  - quote from Finnhub
  - metrics from Finnhub
  - analyst recommendations from Finnhub
  - historical candle data from Polygon
  - ETH/USD price from CoinGecko
- fetches the `buyingId` counter from the backend
- transforms candle data for chart rendering
- sends normalized time-series data to the FastAPI prediction service
- renders charts using Recharts
- connects to MetaMask
- submits stock purchase transactions through the `Stocks` contract
- persists successful purchases to the backend
- increments the backend buying counter after a successful purchase

### Mutual funds list

File:

- [src/MutualFunds/Funds.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/MutualFunds/Funds.jsx)

Responsibilities:

- renders a curated list of mutual fund scheme codes
- fetches fund data from `mfapi.in`
- routes users to `/MutualFunds/:schemeCode`

### Mutual fund detail page

File:

- [src/MutualFunds/FundsPage/FundsPage.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/MutualFunds/FundsPage/FundsPage.jsx)

Responsibilities:

- fetches fund meta and NAV history from `mfapi.in`
- sorts NAV data chronologically
- calculates unit quantity from entered INR amount
- fetches ETH/INR price from CoinGecko
- reads the backend `buyingId` counter
- connects to MetaMask
- submits mutual fund purchases through the `MutualFunds` contract
- persists confirmed purchases to the backend

### Market news

File:

- [src/News/MarketNews.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/News/MarketNews.jsx)

Responsibilities:

- fetches market news from Polygon
- displays image, title, description, keywords, date, and article link

## Data Sources Used By The Frontend

### Backend API

Base URL currently used throughout the app:

```text
http://localhost:3001
```

The frontend reads and writes against backend routes for:

- authentication
- holdings
- buy/sell history
- counter reads and updates

### FastAPI prediction service

Used at:

```text
http://localhost:8001/predict
```

The stock detail page posts transformed OHLC data to this service.

### External market APIs

The client also talks directly to third-party data providers:

- Finnhub
- Polygon
- CoinGecko
- `mfapi.in`

That means the browser-side app depends on valid API keys and internet access for live data views.

## Wallet and Blockchain Integration

The blockchain-facing pieces of the frontend are implemented primarily in:

- [src/Stocks/StockPage/StocksPage.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Stocks/StockPage/StocksPage.jsx)
- [src/Dashboard/Holdings/HoldingsPage.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Dashboard/Holdings/HoldingsPage.jsx)
- [src/MutualFunds/FundsPage/FundsPage.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/MutualFunds/FundsPage/FundsPage.jsx)

The app uses:

- `window.ethereum`
- `ethers.BrowserProvider`
- signer-based contract calls
- ABI files in `src/abi/`

ABI files:

- [src/abi/StocksABI.json](/Users/dhruv/Blockchain/NeuroStock/Client/src/abi/StocksABI.json)
- [src/abi/MutualFundsABI.json](/Users/dhruv/Blockchain/NeuroStock/Client/src/abi/MutualFundsABI.json)

Required wallet expectations:

- MetaMask installed in the browser
- access granted to the page
- correct contract addresses in environment variables
- wallet configured for the expected testnet when performing contract actions

## Charts and Visualization

The frontend uses Recharts for financial and prediction displays.

Examples include:

- historical candle-derived line/bar chart sections on stock detail pages
- analyst recommendation visualization
- ML prediction series for upcoming points
- NAV trend visualization on mutual fund pages

## Loading and Feedback UX

The frontend includes a dedicated transaction loader:

- [src/Components/Loaders/StockLoader.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Components/Loaders/StockLoader.jsx)

It is used during blockchain transaction confirmation to communicate that a chain action is still in progress.

Notification libraries used:

- `react-hot-toast`
- `react-toastify`

These are used for:

- auth success and failure
- wallet connection errors
- prediction errors
- buy/sell transaction feedback
- logout status

## Environment Variables

The frontend uses Vite environment variables.

Create:

- [Client/.env](/Users/dhruv/Blockchain/NeuroStock/Client/.env)

Expected values:

```env
VITE_1ST_FINHUBB_KEY=your_finnhub_key
VITE_2ND_FINHUBB_KEY=your_finnhub_key
VITE_3RD_POLYGON_KEY=your_polygon_key
VITE_CONTRACT_ADDRESS=deployed_stocks_contract_address
VITE_CONTRACT_FUNDS_ADDRESS=deployed_mutual_funds_contract_address
```

### Variable reference

| Variable | Used for |
| --- | --- |
| `VITE_1ST_FINHUBB_KEY` | Stock list company-profile fetches |
| `VITE_2ND_FINHUBB_KEY` | Stock detail quote/profile/metrics/recommendations |
| `VITE_3RD_POLYGON_KEY` | Stock candle data and market news |
| `VITE_CONTRACT_ADDRESS` | Stock contract buy/sell interactions |
| `VITE_CONTRACT_FUNDS_ADDRESS` | Mutual fund contract buy interactions |

## Local Development Setup

Install dependencies:

```bash
cd Client
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

## Vite Configuration

Vite config file:

- [vite.config.js](/Users/dhruv/Blockchain/NeuroStock/Client/vite.config.js)

Current dev server behavior:

- host enabled
- port fixed to `3003`
- strict port enabled

That matters because the backend CORS config is also set to allow `http://localhost:3003`.

## Project Structure

```text
Client/
├── public/
├── src/
│   ├── Components/
│   │   ├── Layouts/
│   │   ├── Loaders/
│   │   ├── Navbar/
│   │   └── SideBar/
│   ├── Dashboard/
│   │   ├── History/
│   │   ├── Holdings/
│   │   ├── Selling/
│   │   └── User/
│   ├── Home/
│   ├── MutualFunds/
│   │   └── FundsPage/
│   ├── News/
│   ├── Stocks/
│   │   └── StockPage/
│   ├── User/
│   │   └── Authenication/
│   ├── abi/
│   ├── assets/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Frontend Data Flow

Typical stock purchase flow:

1. User opens `/Stock/:ticker`.
2. Client fetches live market data from Finnhub and Polygon.
3. Client fetches `buyingId` from the backend.
4. User connects MetaMask.
5. Client converts price from USD to ETH using CoinGecko data.
6. Client calls the stock contract using Ethers.js.
7. After confirmation, client posts purchase details to `POST /Holdings`.
8. Client updates the backend buy counter.
9. Dashboard screens later read the stored result from backend history endpoints.

Typical sell flow:

1. User opens `/Dashboard/holdings`.
2. Client fetches holdings and `sellingId`.
3. Client fetches a live quote for the selected stock.
4. User confirms sell quantity.
5. Client submits the `selling()` contract transaction.
6. Client posts the sell record to `POST /StocksSold`.
7. Client updates the backend sell counter.
8. Client updates or deletes the holdings record in MongoDB through the backend.

## Important Implementation Notes

This section reflects the current frontend codebase as it exists today.

### 1. API URLs are hardcoded in many files

The frontend directly references:

- `http://localhost:3001`
- `http://localhost:8001`

across multiple components instead of using a centralized API config.

### 2. Some API keys are environment-driven, some are not

Most market-data calls use Vite env vars, but the holdings sell flow currently includes a hardcoded Finnhub key in `HoldingsPage.jsx`.

### 3. Route protection depends on backend cookie auth

Protected pages will fail or redirect if:

- the backend is down
- cookies are blocked
- the token is expired
- CORS credentials are misconfigured

### 4. Mutual fund dashboard support is partial on the frontend

The mutual fund list and fund detail buy flow exist, and the backend exposes fund history routes, but the primary dashboard navigation is still centered around stock holdings and stock history pages.

### 5. Direct browser calls to third-party APIs

The app fetches live market data directly in the browser, which keeps things simple for development but also means:

- the client needs API keys
- the UI is more exposed to third-party latency or rate limits
- failures happen directly in the user-facing layer

### 6. Placeholder / unused dependencies exist

The frontend package currently includes some dependencies that are not central to the current implementation, such as `@clerk/clerk-react`, `axios`, and `cors`.

## Suggested Improvements

Strong next steps for the frontend would be:

- centralize API base URLs in a config layer
- centralize all external API keys and remove hardcoded keys from components
- add a reusable request utility for backend calls
- improve loading and empty states across all pages
- surface mutual fund history and holdings in dashboard navigation
- add unit/integration tests for protected route flow and trade pages
- standardize error handling for all fetch requests
- split large feature components like `StocksPage.jsx` into smaller modules

## Useful Files

Good places to start when working on this frontend:

- [src/App.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/App.jsx)
- [src/User/Authenication/Login.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/User/Authenication/Login.jsx)
- [src/User/Authenication/ProtectedRoute.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/User/Authenication/ProtectedRoute.jsx)
- [src/Stocks/StockPage/StocksPage.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Stocks/StockPage/StocksPage.jsx)
- [src/Dashboard/Holdings/HoldingsPage.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Dashboard/Holdings/HoldingsPage.jsx)
- [src/MutualFunds/FundsPage/FundsPage.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/MutualFunds/FundsPage/FundsPage.jsx)
- [src/Components/SideBar/Sidebar.jsx](/Users/dhruv/Blockchain/NeuroStock/Client/src/Components/SideBar/Sidebar.jsx)
