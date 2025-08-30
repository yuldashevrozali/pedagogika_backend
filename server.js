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
app.use(express.urlencoded({ extended: true })); // 🔑 form-data uchun ham

// ✅ User Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3 },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });

const User = mongoose.model("user", userSchema);

// Oddiy route
app.get("/", (req, res) => {
  res.status(200).json({ message: "API ishlayapti 🚀" });
});

// ====================== AUTH ROUTES ======================

// 📌 SIGN UP
app.post("/api/users/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("📥 Sign Up request:", req.body);

    // mavjud userni tekshirish
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Email oldin ro‘yxatdan o‘tgan:", email);
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // parolni hashlash
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    console.log("✅ User ro‘yxatdan o‘tdi:", newUser.username);
    res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      user: { id: newUser._id, username: newUser.username, email: newUser.email }
    });
  } catch (err) {
    console.error("❌ Sign Up xato:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📌 SIGN IN
// 📌 SIGN IN
app.post("/api/users/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
 

// ==========================================================

// MongoDB ulanish va server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB ulandi");

    app.listen(PORT, () => {
      console.log(`✅ Server ${PORT} portda ishlayapti`);
    });
  } catch (err) {
    console.error("❌ MongoDB xato:", err);
    process.exit(1); // serverni to‘xtatish
  }
};

startServer();
