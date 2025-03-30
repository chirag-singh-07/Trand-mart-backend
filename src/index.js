import express from "express";
import dotenv from "dotenv";
import cookiePaeaser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/database.js";
import UserRoute from "./routes/UserRoute.js";
import SelletRoute from "./routes/SellerRoute.js";
import AdminRoute from "./routes/AdminRoute.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", // Local dev for seller fronetnd
  "http://localhost:3000", // Local dev for user fronetnd
  "http://localhost:4000", // local dev for admin frontend
  "https://trendmart-buyers.netlify.app", // Deployed frontend
  "https://trendmart-vendors.netlify.app", // Deloyed seller frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies & authentication headers
  })
);
app.use(express.json());
app.use(cookiePaeaser());

app.get("/health", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/user", UserRoute);
app.use("/api/seller", SelletRoute);
app.use("/api/admin", AdminRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
