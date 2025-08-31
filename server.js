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

// ====================== MODELS ======================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 3 },
  phone: { type: String, required: true, unique: true, match: /^[0-9]{9,15}$/ },
  password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

const testSchema = new mongoose.Schema({
  section: { type: String, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true }
}, { timestamps: true });

const Test = mongoose.model("Test", testSchema);

// ====================== MIDDLEWARE ======================
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Token kerak" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: "Token yaroqsiz" });
    req.user = decoded; // { id: userId }
    next();
  });
}

// ====================== ROUTES ======================

// Oddiy test route
app.get("/", (req, res) => {
  res.status(200).json({ message: "API ishlayapti 🚀" });
});

// 📌 SIGN UP
app.post("/api/users/signup", async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Telefon raqam allaqachon ro‘yxatdan o‘tgan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, phone, password: hashedPassword });
    await newUser.save();

    const accessToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: newUser._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: { id: newUser._id, username: newUser.username, phone: newUser.phone }
    });
  } catch (err) {
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

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, phone: user.phone }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📌 TEST ROUTES (faqat token bilan kiriladi)
app.get("/api/tests", authMiddleware, async (req, res) => {
  try {
    const { section } = req.query;
    let tests;
    if (section) {
      tests = await Test.find({ section });
    } else {
      tests = await Test.find();
    }
    res.json(tests);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/tests", authMiddleware, async (req, res) => {
  try {
    const { section, question, options, answer } = req.body;
    const newTest = new Test({ section, question, options, answer });
    await newTest.save();
    res.json(newTest);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
