const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// 📌 SIGN UP
router.post("/signup", async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: "Telefon oldin ro‘yxatdan o‘tgan" });
    }

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

    res.status(201).json({
      success: true,
      msg: "User registered successfully",
      accessToken,
      refreshToken,
      user: { id: newUser._id, username: newUser.username, phone: newUser.phone }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📌 SIGN IN
router.post("/signin", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ success: false, msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Invalid credentials" });
    }

    // ✅ Access Token (15 min)
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // ✅ Refresh Token (7 kun)
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
