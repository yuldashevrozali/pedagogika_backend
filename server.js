const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ User Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3 },
  phone: { type: String, required: true, unique: true, match: /^[0-9]{9,15}$/ }, // faqat raqam
  password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// Oddiy route
app.get("/", (req, res) => {
  res.status(200).json({ message: "API ishlayapti 🚀" });
});

// ====================== AUTH ROUTES ======================

// 📌 SIGN UP
app.post("/api/users/signup", async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    console.log("📥 Sign Up request:", req.body);

    // mavjud userni tekshirish
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      console.log("❌ Telefon oldin ro‘yxatdan o‘tgan:", phone);
      return res.status(400).json({ success: false, message: "Telefon raqam allaqachon ro‘yxatdan o‘tgan" });
    }

    // parolni hashlash
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, phone, password: hashedPassword });
    await newUser.save();

    // ✅ Access Token (15 min)
    const accessToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // ✅ Refresh Token (7 kun)
    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ User ro‘yxatdan o‘tdi:", newUser.username);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: { id: newUser._id, username: newUser.username, phone: newUser.phone }
    });
  } catch (err) {
    console.error("❌ Sign Up xato:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📌 SIGN IN
app.post("/api/users/signin", async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // ✅ Access Token (15 min)
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // ✅ Refresh Token (7 kun)
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, phone: user.phone }
    });

  } catch (err) {
    console.error("❌ Sign In xato:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================================

// MongoDB ulanish va server start
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
