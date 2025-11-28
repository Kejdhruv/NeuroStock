import express from "express";
import cors from "cors";
import Auth from "./Routes/Authentication/Auth.js"
import HistoryUser from "./Routes/User/HistoryUser.js"
import PostingUser from "./Routes/User/PostingUser.js"
import CounterRoutes from "./Routes/CounterRoute/CounterRoutes.js"
import UpdatingUser from "./Routes/User/UpdatingUser.js"
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3001;
app.use(cookieParser()); 
app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`yo bitch i m there at http://localhost:${PORT}`);
});

app.use("/", Auth); 
app.use("/", HistoryUser); 
app.use("/", PostingUser); 
app.use("/", CounterRoutes); 
app.use("/", UpdatingUser); 

