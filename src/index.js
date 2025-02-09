import express from "express";
import dotenv from "dotenv";
import cookiePaeaser from "cookie-parser";

import connectDB from "./config/database.js";
import UserRoute from "./routes/UserRoute.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
app.use(express.json());
app.use(cookiePaeaser());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/user/auth", UserRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
