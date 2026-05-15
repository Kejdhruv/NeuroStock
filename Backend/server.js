import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import Auth from "./Routes/Authentication/Auth.js";
import HistoryUser from "./Routes/User/HistoryUser.js";
import PostingUser from "./Routes/User/PostingUser.js";
import CounterRoutes from "./Routes/CounterRoute/CounterRoutes.js";
import UpdatingUser from "./Routes/User/UpdatingUser.js";
import database from "./Database/db.js";

const app = express();
const PORT = 3001;
const { connectToDatabase } = database;

app.use(cookieParser());
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3003",
  "http://127.0.0.1:3003",
];

const isLocalNetworkFrontend = (origin) => {
  if (!origin) return false;

  try {
    const { hostname, port, protocol } = new URL(origin);
    return (
      protocol === "http:" &&
      port === "3003" &&
      /^(10|127|192\.168|172\.(1[6-9]|2\d|3[0-1]))\./.test(hostname)
    );
  } catch {
    return false;
  }
};

// Allow credentials from localhost and LAN Vite dev URLs.
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || isLocalNetworkFrontend(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));

// ✅ Routes moved ABOVE listen
app.use("/", Auth);
app.use("/", HistoryUser);
app.use("/", PostingUser);
app.use("/", CounterRoutes);
app.use("/", UpdatingUser);

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
