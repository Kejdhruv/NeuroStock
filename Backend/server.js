import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import Auth from "./Routes/Authentication/Auth.js";
import HistoryUser from "./Routes/User/HistoryUser.js";
import PostingUser from "./Routes/User/PostingUser.js";
import CounterRoutes from "./Routes/CounterRoute/CounterRoutes.js";
import UpdatingUser from "./Routes/User/UpdatingUser.js";
import database from "./Database/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const { connectToDatabase } = database;

app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());

const localOrigins = [
  "http://localhost:3003",
  "http://127.0.0.1:3003",
];

const deployedOrigins = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...localOrigins, ...deployedOrigins];

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

// Allow credentials from configured deployment origins plus local Vite dev URLs.
app.use(cors({
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== "production" && isLocalNetworkFrontend(origin))
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/", Auth);
app.use("/", HistoryUser);
app.use("/", PostingUser);
app.use("/", CounterRoutes);
app.use("/", UpdatingUser);

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
