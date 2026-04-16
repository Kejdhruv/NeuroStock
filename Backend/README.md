# NeuroStock Backend

This backend powers authentication, portfolio persistence, trade history, and counter management for the NeuroStock project. It is a Node.js + Express API that sits between the React client and MongoDB, while also coordinating with the frontend's blockchain transaction flow by storing the off-chain records that the UI needs for dashboards and history screens.

At a high level, the backend is responsible for:

- creating and authenticating users
- issuing JWTs and storing them in HTTP-only cookies
- protecting user-specific portfolio routes
- storing stock and mutual fund holdings after successful on-chain actions
- storing buy and sell history records
- exposing buy/sell counter endpoints used by the client when preparing contract calls

## Stack

- Node.js
- Express
- `cookie-parser`
- `cors`
- `jsonwebtoken`
- `bcryptjs`
- MongoDB native driver
- `nodemon` for local development

## Backend Responsibilities

The backend does not execute blockchain transactions itself. Instead, the frontend performs the MetaMask contract interaction and then calls this API to persist the resulting transaction metadata in MongoDB.

This means the backend is the off-chain persistence and auth layer for:

- user accounts
- current holdings
- stock buy history
- stock sell history
- mutual fund buy history
- mutual fund sell history
- application counters for `buyingId` and `sellingId`

## Server Entry Point

Main server file:

- [server.js](/Users/dhruv/Blockchain/NeuroStock/Backend/server.js)

What it does:

- creates the Express app
- enables JSON body parsing
- enables cookie parsing
- configures CORS for `http://localhost:3003`
- mounts authentication, history, posting, updating, and counter routes
- starts the API on port `3001`

Expected local API base URL:

```text
http://localhost:3001
```

## Directory Structure

```text
Backend/
├── Database/
│   ├── Counter/
│   │   ├── GettingCount/
│   │   └── UpdatingCount/
│   ├── MutualFunds/
│   │   ├── FetchingHistory/
│   │   ├── InsertingFunds/
│   │   └── UpdatingFunds/
│   ├── Stocks/
│   │   ├── FetchingHistory/
│   │   ├── InsertingStocks/
│   │   └── UpdatingStocks/
│   └── User/
├── Middleware/
│   └── DecodeToken.js
├── Routes/
│   ├── Authentication/
│   │   └── Auth.js
│   ├── CounterRoute/
│   │   └── CounterRoutes.js
│   └── User/
│       ├── HistoryUser.js
│       ├── PostingUser.js
│       └── UpdatingUser.js
├── package.json
└── server.js
```

## Request Flow

Typical authenticated trade flow:

1. The user logs in via `/Auth/Login`.
2. The backend sets a JWT in a cookie named `token`.
3. The frontend executes a blockchain transaction using MetaMask.
4. After confirmation, the frontend sends the transaction data to the backend.
5. The backend enriches the payload with `Userid` and `Email` from the decoded JWT.
6. The backend inserts the record into the relevant holdings/history collections.
7. Dashboard and history routes read those collections later using the authenticated user id.

## Authentication Design

Authentication logic lives in:

- [Routes/Authentication/Auth.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Routes/Authentication/Auth.js)
- [Middleware/DecodeToken.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Middleware/DecodeToken.js)

### How auth works

- Users register with `firstName`, `lastName`, `email`, and `password`.
- Passwords are hashed with `bcryptjs`.
- On login, the backend signs a JWT using `process.env.TOKEN_SECRET`.
- The token is stored in an HTTP-only cookie called `token`.
- Protected routes use `authMiddleware` to verify the cookie and populate `req.user`.

### JWT payload

The login route signs a payload that includes:

- `Userid`
- `firstName`
- `lastName`
- `Email`

### Cookie behavior

The login route sets the cookie with:

- `httpOnly: true`
- `sameSite: "strict"`
- `secure: process.env.NODE_ENV === "production"`
- `maxAge: 1 hour`

That makes the auth cookie inaccessible to browser JavaScript and suitable for the `credentials: "include"` requests used by the frontend.

## Route Reference

### Authentication Routes

Base file:

- [Routes/Authentication/Auth.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Routes/Authentication/Auth.js)

#### `POST /Auth/Signup`

Creates a new user account.

Expected body:

```json
{
  "firstName": "Dhruv",
  "lastName": "Kejriwal",
  "email": "dhruv@example.com",
  "password": "your-password"
}
```

Behavior:

- validates required fields
- checks whether a user already exists by email
- hashes the password
- inserts a new user document into `Users`

Success response:

```json
{
  "message": "User added successfully",
  "insertedId": "..."
}
```

#### `POST /Auth/Login`

Authenticates a user and sets the auth cookie.

Expected body:

```json
{
  "email": "dhruv@example.com",
  "password": "your-password"
}
```

Behavior:

- finds the user by email
- compares password hash
- signs a JWT
- returns the user summary
- sets the `token` cookie

#### `GET /Auth/Logout`

Clears the auth cookie.

#### `GET /Auth/Me`

Returns the decoded logged-in user from the auth cookie.

Important note:

- this route reads and verifies the cookie directly
- it does not use `authMiddleware`

### Portfolio History Routes

Base file:

- [Routes/User/HistoryUser.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Routes/User/HistoryUser.js)

All routes in this file require authentication.

#### `GET /Profile/Holdings`

Returns current stock holdings for the authenticated user.

Source collection:

- `Holdings`

#### `GET /Profile/Boughts`

Returns stock buy history for the authenticated user.

Source collection:

- `StockBought`

#### `GET /Profile/SoldStocks`

Returns stock sell history for the authenticated user.

Source collection:

- `SoldStocks`

#### `GET /Profile/FundsHoldings`

Returns mutual fund holdings for the authenticated user.

Source collection:

- `FundsHoldings`

#### `GET /Profile/FundsBoughts`

Returns mutual fund buy history for the authenticated user.

Source collection:

- `FundsBought`

#### `GET /Profile/SoldFunds`

Returns mutual fund sell history for the authenticated user.

Source collection:

- `SoldFunds`

### Trade Persistence Routes

Base file:

- [Routes/User/PostingUser.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Routes/User/PostingUser.js)

All routes in this file require authentication.

#### `POST /Holdings`

Stores a completed stock purchase in MongoDB.

The route:

- receives stock purchase data from the frontend
- attaches `Userid` and `Email` from the auth token
- writes to the `Holdings` collection
- also writes to the `StockBought` collection

Typical payload shape:

```json
{
  "Stockname": "Apple Inc",
  "Stocksymbol": "AAPL",
  "Boughtat": 210.45,
  "Quantity": 2,
  "timestamp": "2026-04-17T10:00:00.000Z",
  "Transactionid": "0x...",
  "buyingid": 42,
  "stockimage": "https://...",
  "accountid": "0x..."
}
```

#### `POST /StocksSold`

Stores a completed stock sell transaction.

The route:

- attaches `Userid` and `Email`
- inserts into `SoldStocks`

Typical payload fields:

- `Stockname`
- `Stocksymbol`
- `Soldat`
- `Quantity`
- `timestamp`
- `Transactionid`
- `sellingid`
- `buyingid`
- `stockimage`
- `accountid`

#### `POST /FundsHoldings`

Stores a completed mutual fund purchase.

The route:

- attaches `Userid` and `Email`
- inserts into `FundsHoldings`
- also inserts into `FundsBought`

Typical payload shape:

```json
{
  "FundName": "Some Fund",
  "SchemeCode": "125497",
  "NAV": 85.12,
  "INRAmount": 5000,
  "Units": 58.74,
  "timestamp": "2026-04-17T10:00:00.000Z",
  "Transactionid": "0x...",
  "buyingid": 55,
  "accountid": "0x..."
}
```

#### `POST /SoldFunds`

Stores a completed mutual fund sell transaction.

The route:

- attaches `Userid` and `Email`
- inserts into `SoldFunds`

### Update and Delete Routes

Base file:

- [Routes/User/UpdatingUser.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Routes/User/UpdatingUser.js)

These routes are currently not protected by auth middleware, so they should be treated carefully in local development and hardened before production use.

#### `PUT /Holdings/:_id`

Updates the `Quantity` field of a stock holding document in `Holdings`.

Expected body:

```json
{
  "Quantity": 3
}
```

#### `DELETE /Holdings/:_id`

Deletes a stock holding document by MongoDB `_id`.

#### `PUT /MutualHoldings/:_id`

Updates the `Quantity` field of a mutual fund holding document in `FundsHoldings`.

#### `DELETE /MutualHoldings/:_id`

Deletes a mutual fund holding document by MongoDB `_id`.

### Counter Routes

Base file:

- [Routes/CounterRoute/CounterRoutes.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Routes/CounterRoute/CounterRoutes.js)

These routes manage simple counter documents in the `Counter` collection. The frontend uses them to obtain and increment ids before contract transactions.

#### `GET /Counter/buyingId`

Returns the counter document with `_id: "buyingId"`.

Example response:

```json
[
  {
    "_id": "buyingId",
    "value": 42
  }
]
```

#### `PUT /Counter/buyingId`

Expected body:

```json
{
  "value": 43
}
```

#### `GET /Counter/sellingId`

Returns the counter document with `_id: "sellingId"`.

#### `PUT /Counter/sellingId`

Expected body:

```json
{
  "value": 44
}
```

## Database Layer

The backend uses small helper modules under `Backend/Database/` instead of a service class or ORM abstraction. Each helper:

- creates a MongoDB client
- connects to the local MongoDB server
- performs one query or mutation
- returns the result

Database name:

```text
STOCKDATA
```

Default MongoDB URL in the code:

```text
mongodb://localhost:27017
```

### Collections Used

| Collection | Purpose |
| --- | --- |
| `Users` | Registered users |
| `Holdings` | Current stock holdings |
| `StockBought` | Stock purchase history |
| `SoldStocks` | Stock sell history |
| `FundsHoldings` | Current mutual fund holdings |
| `FundsBought` | Mutual fund purchase history |
| `SoldFunds` | Mutual fund sell history |
| `Counter` | `buyingId` and `sellingId` counter documents |

### Data Access Pattern

Examples:

- [Database/User/CreatingUser.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Database/User/CreatingUser.js)
- [Database/User/GetUser.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Database/User/GetUser.js)
- [Database/Stocks/InsertingStocks/PostingHoldings.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Database/Stocks/InsertingStocks/PostingHoldings.js)
- [Database/Counter/UpdatingCount/CounterUpdate2.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Database/Counter/UpdatingCount/CounterUpdate2.js)

Most helpers are small single-purpose functions such as:

- insert many documents
- fetch all user documents of a given type
- update one document by `_id`
- delete one document by `_id`
- read or update one counter by its string `_id`

## Environment Variables

The backend currently requires only a small environment file.

Create:

- [Backend/.env](/Users/dhruv/Blockchain/NeuroStock/Backend/.env)

Example:

```env
TOKEN_SECRET=replace_with_a_secure_random_secret
NODE_ENV=development
```

### Variable reference

| Variable | Required | Purpose |
| --- | --- | --- |
| `TOKEN_SECRET` | Yes | Signs and verifies JWT auth cookies |
| `NODE_ENV` | Recommended | Controls cookie `secure` flag in login/logout |

## Running The Backend

Install dependencies:

```bash
cd Backend
npm install
```

Start in development mode:

```bash
npm run dev
```

Start in normal mode:

```bash
npm start
```

Expected startup message:

```text
Server running at http://localhost:3001
```

## Frontend Integration Expectations

The React client is tightly coupled to a few backend assumptions:

- requests include `credentials: "include"` so cookies are sent
- the frontend talks to `http://localhost:3001`
- CORS is configured for `http://localhost:3003`
- trade-persistence calls happen only after blockchain confirmation

If you change backend host, frontend host, or cookie settings, the login flow and protected dashboard routes may stop working until both sides are updated.

## Current Implementation Notes

This README is intentionally aligned with the current codebase, including a few things worth knowing before you extend it.

### 1. MongoDB is hardcoded

Most database helpers hardcode:

```text
mongodb://localhost:27017
```

and:

```text
STOCKDATA
```

So the backend is not yet environment-driven for database configuration.

### 2. Helper modules are one-query-per-file

The current structure favors many tiny modules instead of a shared repository or model layer. It is simple to follow, but repetitive.

### 3. Mixed module style

Route files and the server use ESM-style `import` syntax, while many database helper files use CommonJS `require` / `module.exports`.

That is an important implementation detail to keep in mind if you refactor or standardize the backend later.

### 4. Some read helpers do not close the Mongo client

Several fetch helpers connect to MongoDB and return results without closing the client in a `finally` block. This is useful to know if you see connection-handling issues or want to improve the data layer.

### 5. Update and delete routes are not auth-protected

The routes in `UpdatingUser.js` currently do not use `authMiddleware`. That is a security gap if this backend is ever exposed beyond trusted local development.

### 6. Counter route import mismatch

`CounterRoutes.js` imports `UpdatingBuyingCounter` from `CounterUpdate2.js` instead of `CounterUpdate.js`, even though both update files exist. The current logic may still work because both counters are stored in the same collection and updated by `_id`, but the file structure suggests the intent was to keep those concerns separate.

### 7. Mutual holdings update import mismatch

`UpdatingUser.js` imports `UpdatingFunds` from `DeletingFundHoldings.js` even though there is also an `UpdatingFunds.js` file present in the codebase. That is a good place to verify before relying on the mutual fund quantity update route.

## Example Local Test Flow

A quick manual smoke test for the backend looks like this:

1. Start MongoDB locally.
2. Start the backend with `npm run dev`.
3. Register a user with `POST /Auth/Signup`.
4. Login with `POST /Auth/Login`.
5. Confirm the browser or client stores the `token` cookie.
6. Call `GET /Auth/Me` and confirm user data is returned.
7. Call `GET /Profile/Holdings` and confirm the route requires auth.
8. Execute a frontend trade flow and confirm inserts appear in the right MongoDB collections.

## Suggested Improvements

If you continue evolving the backend, these would be strong next steps:

- move MongoDB URL and database name into environment variables
- unify the backend around ESM or CommonJS instead of mixing both
- introduce a shared Mongo client instead of connecting per helper
- protect update and delete routes with authentication
- add request validation for all write endpoints
- add route-level tests and integration tests
- create a centralized config module for ports, CORS origins, and secrets
- normalize naming like `SoldingStocks` to `SellingStocks` for clarity

## Related Files

Useful entry points when working on the backend:

- [server.js](/Users/dhruv/Blockchain/NeuroStock/Backend/server.js)
- [Routes/Authentication/Auth.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Routes/Authentication/Auth.js)
- [Routes/User/HistoryUser.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Routes/User/HistoryUser.js)
- [Routes/User/PostingUser.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Routes/User/PostingUser.js)
- [Routes/User/UpdatingUser.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Routes/User/UpdatingUser.js)
- [Routes/CounterRoute/CounterRoutes.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Routes/CounterRoute/CounterRoutes.js)
- [Middleware/DecodeToken.js](/Users/dhruv/Blockchain/NeuroStock/Backend/Middleware/DecodeToken.js)
