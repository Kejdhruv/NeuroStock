# NeuroStock — AI-Powered Blockchain Trading Platform

NeuroStock is a full-stack blockchain-based virtual trading platform that simulates real-world stock and fund trading using Ethereum smart contracts, AI-driven stock prediction, and live financial APIs.

Each user has a secure, personalized portfolio to track holdings, transactions, and performance — all backed by JWT authentication, MongoDB, and Solidity smart contracts deployed on the Sepolia Ethereum Testnet.

<img width="480" height="480" alt="Screenshot 2025-12-18 at 12 03 32" src="https://github.com/user-attachments/assets/7add7280-154e-43d7-8905-8aadb96dd8b0" />
<img width="480" height="480" alt="Screenshot 2025-12-18 at 12 07 43" src="https://github.com/user-attachments/assets/65a357b4-5781-4194-88b6-d2f89e9dae15" />
<img width="480" height="480" alt="Screenshot 2025-12-18 at 12 04 10" src="https://github.com/user-attachments/assets/d03242ea-0aeb-47e8-b8cc-0f109ef235d6" />
<img width="480" height="480" alt="Screenshot 2025-12-18 at 12 03 53" src="https://github.com/user-attachments/assets/89828ae1-dd9c-434d-8ed2-2d2dca9816d3" />
<img width="480" height="480" alt="Screenshot 2025-12-18 at 12 07 09" src="https://github.com/user-attachments/assets/85ed2ae7-1794-4e6e-a0a3-961388405a0a" />
<img width="480" height="480" alt="Screenshot 2025-12-18 at 12 07 20" src="https://github.com/user-attachments/assets/2a5161bb-8a5c-4122-902d-932aaf53aca7" />
 <img width="480" height="480" alt="Screenshot 2025-12-18 at 12 04 23" src="https://github.com/user-attachments/assets/35e2a165-2e51-4264-9351-5aa5759fdcca" />
 <img width="480" height="480" alt="Screenshot 2025-12-18 at 12 04 37" src="https://github.com/user-attachments/assets/1c3bebba-0307-49a7-8a6b-59b6406dcc5b" />
 <img width="480" height="480" alt="Screenshot 2025-12-18 at 12 04 51" src="https://github.com/user-attachments/assets/d21df640-4446-419a-91f5-7d49799eb72c" />
<img width="480" height="480" alt="Screenshot 2025-12-18 at 12 07 58" src="https://github.com/user-attachments/assets/02a2f188-78d0-4dec-aae6-f7153da9dc82" />

 






---


## 🚀 Core Features

## 🔐 Authentication & User Interaction
- JWT token-based authentication  
- Tokens stored securely in HTTP-only cookies  
- bcrypt.js used for hashing and verifying user passwords  
- Secure Login & Signup system  
- Persistent user sessions across browser refreshes  
- Role-safe, user-specific interactions across the platform  
- Protected routes using JWT decoding middleware  

## 🔒 Security Highlights
- Passwords are never stored in plain text  
- bcrypt hashing with salt ensures resistance to brute-force attacks  
- JWT tokens are inaccessible to client-side JavaScript (HTTP-only)  
- Authentication middleware validates user identity on every protected request  

## 🧑‍💼 User Accounts & Portfolio
- MongoDB stores:
  - User profiles  
  - Stock holdings  
  - Fund holdings  
  - Buy & sell history  
- Each user has a personal portfolio dashboard  
- Track:
  - Invested amount  
  - Current value  
  - Performance metrics  
  - Transaction history  

## 🔗 Blockchain Integration
- Smart contracts written in Solidity  
- Developed and deployed using Hardhat  
- Deployed on Ethereum Sepolia Testnet  
- MetaMask used for:
  - Wallet connection  
  - Managing user Ethereum accounts  
  - Signing blockchain transactions  

## 🧾 Smart Contracts
- **Stock Smart Contract**
  - Handles stock buy/sell logic  
  - Tracks blockchain-level transactions  
- **Fund Smart Contract**
  - Manages mutual fund-like assets  
  - Ensures on-chain transparency  

## 📊 Stocks & Funds Trading
- Buy & sell stocks using virtual/testnet ETH  
- Trade funds via a separate smart contract  
- Blockchain ensures transaction integrity  
- Backend syncs blockchain transactions with MongoDB records  

## 🌐 Live Market Data
- Finnhub API  
  - Real-time stock prices  
- Polygon API  
  - Additional stock & fund market data  
- CoinGecko API  
  - ETH → USD / INR conversion  
  - Real-time cryptocurrency pricing  

Live prices are fetched dynamically and **not stored in MongoDB** to avoid data redundancy and heavy storage usage.

## 🤖 AI-Based Stock Prediction
- LSTM (Long Short-Term Memory) model  
- Predicts stock price behavior and trends  
- Uses historical stock data  
- Helps users analyze potential future movement  
- Integrated as an assistive analytics feature (not financial advice)  

## 🧠 Portfolio Analytics
- Individual user dashboards  
- Performance tracking over time  
- Profit/Loss visualization  
- Holdings breakdown  
- Stock & fund allocation insights  

---

## 🛠 Tech Stack

### Frontend
- React.js (Vite)  
- CSS  
- Ethers.js  
- Web3.js  
- react-router-dom  

### Backend
- Node.js 20.x  
- Express.js  
- JWT Authentication  
- Cookie-based session handling  
- bcrypt.js  
- CORS  
- FastAPI (Python) — serves the LSTM prediction model  

### Database
- MongoDB  
- Mongoose ORM  

### Blockchain
- Solidity  
- Hardhat  
- MetaMask  
- Ethereum Sepolia Testnet  

### APIs
- Finnhub API (stocks)  
- Polygon API (stocks & funds)  
- CoinGecko API (ETH conversion)  

### Machine Learning
- LSTM (Long Short-Term Memory)  
- Python  
- FastAPI  
- Uvicorn  

---

## 📂 File Structure

NeuroStock/
│
├── Backend/
│   ├── Database/
│   │   ├── Counter/
│   │   ├── MutualFunds/
│   │   ├── Stocks/
│   │   └── User/
│   ├── Middleware/
│   │   └── DecodeToken.js
│   ├── Routes/
│   │   ├── Authentication/
│   │   ├── CounterRoute/
│   │   └── User/
│   ├── server.js
│   └── .env
│
├── Client/
│   ├── src/
│   │   ├── Components/
│   │   ├── Dashboard/
│   │   ├── Stocks/
│   │   ├── MutualFunds/
│   │   ├── User/
│   │   └── App.jsx
│
├── Contract/
│   ├── contracts/
│   │   ├── Stocks.sol
│   │   └── MutualFunds.sol
│   ├── scripts/
│   └── hardhat.config.js
│
├── PredictionModel/
│   ├── app.py
│   ├── model.pkl
│   ├── schemas.py
│   └── requirements.txt
│ 
└── README.md



---

## 🔁 High Level Data Flow
User
→ React Client
→ Node.js Backend
→ MongoDB (User & Portfolio Data)
→ Ethereum Smart Contracts (Sepolia)
→ FastAPI (LSTM Predictions)
→ Client Dashboard

---

## 🗄 Database Design (MongoDB)

### 👤 User Collection

{
  "_id": "6887820f66c2493457d259af",
  "firstName": "Dhruv",
  "lastName": "Kejriwal",
  "email": "dhruvnkejriwal@gmail.com",
  "password": "$2b$10$hashedPassword"
}

### 📈 Stocks / Funds Bought Collection
{
  "_id": "693bbe8707979ae0b5bee2b9",
  "Stockname": "Bank of America Corp",
  "Stocksymbol": "BAC",
  "Boughtat": 54.56,
  "Quantity": 2,
  "timestamp": "2025-12-12T07:04:39.305Z",
  "Transactionid": "0xc235f7acefb3e761af65e8f765aaea3eda84bd96165a00d1773d5bdebd0cccd3",
  "buyingid": 27,
  "stockimage": "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/BAC.png",
  "accountid": "0x929bc96a333c12313df491823afd30062aee4e53",
  "Userid": "6887820f66c2493457d259af",
  "Email": "dhruvnkejriwal@gmail.com"
}
Purpose
	•	Represents on-chain buy transactions
	•	Links MongoDB data with Ethereum via transaction hash
	•	Used for holdings calculation and performance tracking


### 📉 Stocks / Funds Sold Collection
{
  "_id": "6929b421bb5337e08ebc1e1b",
  "Stockname": "Bank of America Corp",
  "Stocksymbol": "BAC",
  "Soldat": 53.285,
  "Quantity": 2,
  "timestamp": "2025-11-28T14:39:29.169Z",
  "Transactionid": "0x1c9c4973f571ad54c84bdba4147cde105ca405ebd4da3b4ce477a21ea3e1821a",
  "sellingid": 27,
  "buyingid": 25,
  "stockimage": "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/BAC.png",
  "accountid": "0xac378cf9d0456eac19b523819dfc9f63a7c011e4",
  "Userid": "6929b3b4bb5337e08ebc1e19",
  "Email": "amit.dev@gmail.com"
}
Purpose
	•	Tracks realized profit/loss
	•	Links sell to original buy
	•	Blockchain hash ensures verifiable selling action

### 📦 Holdings Collection
{
  "_id": "693bbe8707979ae0b5bee2b9",
  "Stockname": "Bank of America Corp",
  "Stocksymbol": "BAC",
  "Boughtat": 54.56,
  "Quantity": 2,
  "timestamp": "2025-12-12T07:04:39.305Z",
  "Transactionid": "0xc235f7acefb3e761af65e8f765aaea3eda84bd96165a00d1773d5bdebd0cccd3",
  "buyingid": 27,
  "stockimage": "https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/BAC.png",
  "accountid": "0x929bc96a333c12313df491823afd30062aee4e53",
  "Userid": "6887820f66c2493457d259af",
  "Email": "dhruvnkejriwal@gmail.com"
}
Purpose
	•	Represents unsold assets
	•	Updated automatically on buy/sell
	•	Used for real-time portfolio view

### 🔢 Counter Collection
{
  "_id": "sellingId",
  "value": 29
}
{
  "_id": "buyingId",
  "value": 28
}

## ⚙️ Installation & Setup

🔧 Prerequisites
	•	Node.js v20.x
	•	npm
	•	MongoDB (local or cloud)
	•	Python 3.9+
	•	MetaMask Browser Extension
	•	Git

## 📥 Clone Repository

git clone https://github.com/your-username/NeuroStock.git
cd NeuroStock

## 🧠 Backend Setup
cd Backend
npm install
npm start

## Environment Variables (Backend/.env)
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
FINNHUB_API_KEY=your_finnhub_key
POLYGON_API_KEY=your_polygon_key

## 🖥 Frontend Setup
cd Client
npm install
npm run dev

## 🔗 Blockchain Setup (Hardhat)
cd Contract
npm install
npx hardhat compile
npx hardhat run scripts/Deploy.js --network sepolia
npx hardhat run scripts/Deploy2.js --network sepolia 

## 🤖 AI Model Setup (FastAPI)
cd PredictionModel
pip install -r requirements.txt
uvicorn app:app --reload

## ⚠️ Disclaimer

NeuroStock is an educational and simulation-based project.
It does not provide financial advice and does not involve real money.
All blockchain transactions use Ethereum testnet ETH only.

⸻

## 👨‍💻 Author

Dhruv Kejriwal
Full Stack Developer | Blockchain & AI Enthusiast
MERN • Web3 • Solidity • AI/ML
