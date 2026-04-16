# NeuroStock

NeuroStock is a full-stack virtual investing platform that combines a React frontend, an Express API, MongoDB persistence, Ethereum smart contracts, and a FastAPI-based prediction service. The project lets users sign up, connect MetaMask, explore selected equities and mutual funds, execute blockchain-backed buy and sell flows, and review portfolio activity through a protected dashboard.

The repository is organized as a multi-service workspace:

- `Client/` contains the Vite + React user interface.
- `Backend/` contains the Express API, authentication logic, and MongoDB data layer.
- `Contract/` contains the Solidity contracts, Hardhat config, deployment scripts, and tests.
- `PredictionModel/` contains the FastAPI inference service and serialized ML model.

<img width="450" height="450" alt="Screenshot 2025-12-18 at 12 03 32" src="https://github.com/user-attachments/assets/7add7280-154e-43d7-8905-8aadb96dd8b0" />
<img width="450" height="450" alt="Screenshot 2025-12-18 at 12 07 43" src="https://github.com/user-attachments/assets/65a357b4-5781-4194-88b6-d2f89e9dae15" />
<img width="450" height="450" alt="Screenshot 2025-12-18 at 12 04 10" src="https://github.com/user-attachments/assets/d03242ea-0aeb-47e8-b8cc-0f109ef235d6" />
<img width="450" height="450" alt="Screenshot 2025-12-18 at 12 03 53" src="https://github.com/user-attachments/assets/89828ae1-dd9c-434d-8ed2-2d2dca9816d3" />
<img width="450" height="450" alt="Screenshot 2025-12-18 at 12 07 09" src="https://github.com/user-attachments/assets/85ed2ae7-1794-4e6e-a0a3-961388405a0a" />
<img width="450" height="450" alt="Screenshot 2025-12-18 at 12 07 20" src="https://github.com/user-attachments/assets/2a5161bb-8a5c-4122-902d-932aaf53aca7" />
 <img width="450" height="450" alt="Screenshot 2025-12-18 at 12 04 23" src="https://github.com/user-attachments/assets/35e2a165-2e51-4264-9351-5aa5759fdcca" />
 <img width="450" height="450" alt="Screenshot 2025-12-18 at 12 04 37" src="https://github.com/user-attachments/assets/1c3bebba-0307-49a7-8a6b-59b6406dcc5b" />
 <img width="450" height="450" alt="Screenshot 2025-12-18 at 12 04 51" src="https://github.com/user-attachments/assets/d21df640-4446-419a-91f5-7d49799eb72c" />
<img width="450" height="450" alt="Screenshot 2025-12-18 at 12 07 58" src="https://github.com/user-attachments/assets/02a2f188-78d0-4dec-aae6-f7153da9dc82" />

---

## Overview

NeuroStock is built around a hybrid trading workflow:

- Market discovery happens in the React client using live third-party market data APIs.
- User identity and portfolio records are managed by the Express backend with JWT cookies.
- Buy and sell actions are executed through Ethereum smart contracts using MetaMask.
- Off-chain records of holdings and transaction history are stored in MongoDB.
- A Python prediction service consumes historical candles and returns short-horizon price forecasts for stock detail pages.

The result is a project that mixes Web2 app architecture with Web3 execution and a separate ML inference service.

## What The App Does

### Authentication and account flow

- Sign up and login are handled from `/Auth`.
- Passwords are hashed with `bcryptjs` before storage.
- Successful login issues a JWT stored in an HTTP-only cookie.
- Protected routes gate stock detail pages, mutual fund detail pages, and the dashboard.
- User context is resolved on the backend through middleware that decodes the JWT cookie.

### Stock experience

- Browse a curated stock list on `/Stocks`.
- Open a dedicated stock page at `/Stock/:ticker`.
- View company profile information, current quote data, key metrics, and analyst recommendations.
- Pull historical candles from Polygon and visualize them with Recharts.
- Run ML inference against the last 100 candle closes from the FastAPI service.
- Connect MetaMask and execute stock purchases through the `Stocks` smart contract.
- Persist holdings and buy history in MongoDB after on-chain confirmation.

### Mutual fund experience

- Browse selected mutual funds on `/MutualFunds`.
- Open a dedicated mutual fund detail page at `/MutualFunds/:schemeCode`.
- Fetch NAV history from `mfapi.in`.
- Convert INR amounts to ETH using CoinGecko market pricing.
- Connect MetaMask and execute purchases through the `MutualFunds` smart contract.
- Persist fund holdings and transaction records in MongoDB.

### Portfolio and history

- `/Dashboard` shows a protected summary of the user portfolio.
- Holdings, buy history, and sell history views are available for stocks.
- Etherscan links are rendered for recorded transaction hashes on Sepolia.
- The backend also exposes mutual fund portfolio endpoints, even though the current dashboard UI is primarily wired around stock views.

### Blockchain layer

- Two Solidity contracts are included:
  - `Stocks.sol`
  - `MutualFunds.sol`
- Hardhat is used for compilation, local testing, and deployment scripts.
- Contracts expose buy, sell, history lookup, and contract-balance functions.
- The UI interacts with deployed contract addresses through ABI files in `Client/src/abi/`.

### Prediction service

- `PredictionModel/app.py` exposes a FastAPI endpoint at `POST /predict`.
- The service loads a serialized model from `model.pkl` on startup.
- The stock detail page sends up to 100 normalized OHLC rows and receives:
  - a next-price prediction
  - rolling future predictions
  - scaling metadata used during inference

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Recharts
- Ethers.js
- React Hot Toast
- React Toastify
- CSS modules/files per feature area

### Backend

- Node.js
- Express
- JWT authentication
- Cookie-based auth sessions
- bcryptjs
- CORS
- Native MongoDB driver

### Blockchain

- Solidity `0.8.28`
- Hardhat
- Ethers.js
- MetaMask
- Sepolia testnet

### ML service

- FastAPI
- Uvicorn
- NumPy
- Joblib
- scikit-learn
- TensorFlow-backed loaded model logic in the service

### Data providers

- Finnhub for stock profile, quote, metric, and recommendation data
- Polygon for stock candles and market news
- CoinGecko for ETH price conversion
- `mfapi.in` for mutual fund NAV history

## Architecture

```text
React Client
  -> third-party market data APIs for read-only market views
  -> MetaMask + deployed contracts for buy/sell transactions
  -> Express API for auth, counters, holdings, and history

Express API
  -> JWT cookie auth
  -> MongoDB collections for users, holdings, buy history, sell history, and counters

FastAPI Prediction Service
  -> serialized model inference for stock detail pages

Hardhat / Solidity
  -> Stocks and MutualFunds contracts deployed to Sepolia
```

## Repository Structure

```text
NeuroStock/
├── Assets/                       # README screenshots and project media
├── Backend/
│   ├── Database/
│   │   ├── Counter/             # Buying and selling ID counters
│   │   ├── MutualFunds/         # Fund inserts, updates, and history fetchers
│   │   ├── Stocks/              # Stock inserts, updates, and history fetchers
│   │   └── User/                # User creation and lookup helpers
│   ├── Middleware/
│   │   └── DecodeToken.js       # JWT cookie auth middleware
│   ├── Routes/
│   │   ├── Authentication/
│   │   ├── CounterRoute/
│   │   └── User/
│   ├── package.json
│   └── server.js
├── Client/
│   ├── public/
│   ├── src/
│   │   ├── Components/          # Layout, navbar, sidebar, loaders
│   │   ├── Dashboard/           # Holdings, history, sell history, summary
│   │   ├── Home/
│   │   ├── MutualFunds/
│   │   ├── News/
│   │   ├── Stocks/
│   │   ├── User/
│   │   ├── abi/                 # Contract ABIs consumed by the client
│   │   └── assets/
│   ├── package.json
│   └── vite.config.js
├── Contract/
│   ├── contracts/
│   │   ├── MutualFunds.sol
│   │   └── Stocks.sol
│   ├── scripts/
│   │   ├── Deploy.js
│   │   └── Deploy2.js
│   ├── test/
│   │   └── Contract.js
│   ├── hardhat.config.js
│   └── package.json
├── PredictionModel/
│   ├── app.py
│   ├── model.pkl
│   ├── requirements.txt
│   └── schemas.py
└── README.md
```

## Frontend Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/Auth` | Login and signup |
| `/Stocks` | Curated stock list |
| `/Stock/:ticker` | Protected stock details, charts, ML prediction, buy flow |
| `/MarketNews` | Market news feed |
| `/MutualFunds` | Mutual fund list |
| `/MutualFunds/:schemeCode` | Protected mutual fund details and buy flow |
| `/Dashboard` | Protected dashboard summary |
| `/Dashboard/holdings` | Stock holdings |
| `/Dashboard/buy-history` | Stock buy history |
| `/Dashboard/sell-history` | Stock sell history |

## Backend API Summary

### Authentication

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/Auth/Signup` | Register a new user |
| `POST` | `/Auth/Login` | Login and set JWT cookie |
| `GET` | `/Auth/Logout` | Clear auth cookie |
| `GET` | `/Auth/Me` | Return decoded logged-in user |

### Portfolio and history

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/Profile/Holdings` | Fetch stock holdings for current user |
| `GET` | `/Profile/Boughts` | Fetch stock buy history |
| `GET` | `/Profile/SoldStocks` | Fetch stock sell history |
| `GET` | `/Profile/FundsHoldings` | Fetch mutual fund holdings |
| `GET` | `/Profile/FundsBoughts` | Fetch mutual fund buy history |
| `GET` | `/Profile/SoldFunds` | Fetch mutual fund sell history |

### Trading persistence

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/Holdings` | Store stock holding and buy record |
| `POST` | `/StocksSold` | Store stock sell record |
| `POST` | `/FundsHoldings` | Store mutual fund holding and buy record |
| `POST` | `/SoldFunds` | Store mutual fund sell record |
| `PUT` | `/Holdings/:_id` | Update stock holding quantity |
| `DELETE` | `/Holdings/:_id` | Delete stock holding |
| `PUT` | `/MutualHoldings/:_id` | Update mutual fund holding quantity |
| `DELETE` | `/MutualHoldings/:_id` | Delete mutual fund holding |

### Counters

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/Counter/buyingId` | Read buy counter |
| `PUT` | `/Counter/buyingId` | Update buy counter |
| `GET` | `/Counter/sellingId` | Read sell counter |
| `PUT` | `/Counter/sellingId` | Update sell counter |

## Environment Variables

The project currently reads a mix of frontend and backend environment variables. Create your own local `.env` files instead of committing real keys or secrets.

### `Client/.env`

```env
VITE_1ST_FINHUBB_KEY=your_finnhub_key
VITE_2ND_FINHUBB_KEY=your_finnhub_key
VITE_3RD_POLYGON_KEY=your_polygon_key
VITE_CONTRACT_ADDRESS=deployed_stocks_contract_address
VITE_CONTRACT_FUNDS_ADDRESS=deployed_mutual_funds_contract_address
```

### `Backend/.env`

```env
TOKEN_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

### Recommended contract config

The current Hardhat config stores the Sepolia RPC URL and private key directly in `Contract/hardhat.config.js`. For a safer setup, move them into environment variables before sharing or deploying from this repository.

Example:

```env
SEPOLIA_RPC_URL=your_rpc_url
PRIVATE_KEY=your_wallet_private_key
```

## Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd NeuroStock
```

### 2. Install dependencies

```bash
cd Client && npm install
cd ../Backend && npm install
cd ../Contract && npm install
cd ../PredictionModel && python -m venv .venv
```

Activate the virtual environment and install Python dependencies:

```bash
cd PredictionModel
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Make sure required services are available

- MongoDB should be running locally on `mongodb://localhost:27017`.
- MetaMask should be installed in the browser.
- The selected wallet should be configured for Sepolia if you want on-chain flows to work.
- Your deployed contract addresses should match the values used in `Client/.env`.

### 4. Start the services

Start the backend:

```bash
cd Backend
npm run dev
```

Start the prediction service:

```bash
cd PredictionModel
source .venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

Start the frontend:

```bash
cd Client
npm run dev
```

By default, the codebase expects:

- frontend on `http://localhost:3003`
- backend on `http://localhost:3001`
- prediction service on `http://localhost:8001`

Note: the backend CORS setup is currently pinned to `http://localhost:3003`, so if Vite starts on a different port you should update `Backend/server.js` or align the frontend port configuration.

## Available Scripts

### Client

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
npm run dev
npm start
```

### Contract

The package does not currently define a full Hardhat script set in `package.json`, but you can still use Hardhat through `npx`.

```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/Deploy.js --network sepolia
npx hardhat run scripts/Deploy2.js --network sepolia
```

### Prediction service

```bash
uvicorn app:app --reload --port 8001
```

## Smart Contracts

### `Stocks.sol`

Supports:

- buying stock positions on-chain
- selling previously bought positions
- reading bought history
- reading sold history
- reading holdings
- contract deposit and withdrawal helpers
- contract balance lookup

### `MutualFunds.sol`

Supports:

- buying mutual fund positions on-chain
- selling mutual fund positions
- reading fund history and holdings
- contract balance helpers similar to the stock contract

### Existing contract tests

`Contract/test/Contract.js` currently covers:

- user creation in the stock contract
- stock purchase execution
- stock selling execution
- contract balance verification after trades

## Machine Learning Service

The prediction service is intentionally separated from the Node backend and runs as its own process.

Workflow:

1. The client fetches historical daily candle data from Polygon.
2. The last 100 closing prices are normalized.
3. The FastAPI service loads `model.pkl` and runs inference.
4. The response is rendered back into charts on the stock detail page.

The endpoint shape is:

```http
POST /predict
Content-Type: application/json
```

Request body:

```json
{
  "timeseries": [
    {
      "date": "2026-04-01",
      "open": 170.2,
      "high": 172.1,
      "low": 169.4,
      "close": 171.3
    }
  ]
}
```

The backend expects at least 100 rows for reliable inference and pads data client-side when needed.

## Data Persistence Model

MongoDB is used for the application state that should remain available independently of chain calls:

- users
- stock holdings
- stock buy history
- stock sell history
- mutual fund holdings
- mutual fund buy history
- mutual fund sell history
- buy/sell counters used by the app

In practice, the project uses MongoDB as the source of truth for dashboard rendering, while transaction hashes provide the bridge back to blockchain verification on Etherscan.

## Important Implementation Notes

- The backend database helpers currently target a local MongoDB instance at `mongodb://localhost:27017`.
- Several client requests use hardcoded `http://localhost:3001` and `http://localhost:8001` URLs instead of a centralized API config.
- The market news page currently uses a fixed `published_utc.gte` value in the Polygon request, so the feed logic may need refreshing over time.
- The dashboard UI is focused on stock holdings and stock history screens; mutual fund backend support exists but is not fully surfaced in the main dashboard navigation.
- The Hardhat config currently contains inline Sepolia credentials and should be cleaned up before publishing or deploying from a shared environment.
- The prediction service imports TensorFlow-related functionality even though `requirements.txt` does not list TensorFlow explicitly, so your Python environment may need an additional install depending on how `model.pkl` was created.

## Suggested Run Order

When running the full stack locally, start services in this order:

1. MongoDB
2. Backend API
3. PredictionModel FastAPI service
4. Frontend client
5. MetaMask connection in the browser

This avoids login, portfolio, and prediction calls failing during initial app load.

## Future Improvements

Good next steps for the project would be:

- move all hardcoded hosts and RPC credentials into environment variables
- add a root-level workspace script to run all services together
- surface mutual fund holdings and history in the dashboard UI
- add backend validation and stronger error handling around trade persistence
- expand Hardhat scripts and package commands
- document or version the ML training pipeline in addition to inference
- add automated tests for the Express API and React flows

## Disclaimer

NeuroStock is a development and learning project. It simulates investing workflows with live market data and blockchain-backed transactions on test infrastructure, and its prediction module should not be treated as financial advice.
