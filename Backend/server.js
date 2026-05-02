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

// ✅ FIXED CORS — no wildcard allowed for cookies
app.use(cors({
  origin: "http://localhost:3003",
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
