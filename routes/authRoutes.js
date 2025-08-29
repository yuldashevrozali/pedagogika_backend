const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// 📌 SIGN UP
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("📥 Sign Up request keldi:", req.body);

    // email mavjudligini tekshirish
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Email oldin ro‘yxatdan o‘tgan:", email);
      return res.status(400).json({ msg: "Email already registered" });
    }

    // parolni hashlash
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    console.log("✅ User ro‘yxatdan o‘tdi:", newUser.username);

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("❌ Sign Up xato:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 SIGN IN
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("📥 Sign In request keldi:", req.body);

    // userni topish
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User topilmadi:", email);
      return res.status(400).json({ msg: "User not found" });
    }

    // parolni tekshirish
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Noto‘g‘ri parol:", email);
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // token yaratish
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ User login qildi:", user.username);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("❌ Sign In xato:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
