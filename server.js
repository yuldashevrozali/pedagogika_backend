const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================== ROUTES ======================

// Import routes
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const resultRoutes = require("./routes/resultRoutes");

// Oddiy test route
app.get("/", (req, res) => {
  res.status(200).json({ message: "API ishlayapti 🚀" });
});

// Use routes
app.use("/api/users", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/results", resultRoutes);

// ====================== START SERVER ======================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB ulandi");

    app.listen(PORT, () => {
      console.log(`✅ Server ${PORT} portda ishlayapti`);
    });
  } catch (err) {
    console.error("❌ MongoDB xato:", err);
    process.exit(1);
  }
};

startServer();
