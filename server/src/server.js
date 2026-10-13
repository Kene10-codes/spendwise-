
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");


const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// Health-check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SpendWise API is running",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`SpendWise API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start SpendWise:", error.message);
    process.exit(1);
  }
}

startServer();
