const express = require("express");
const router = express.Router();
const User = require("../models/user.js");

// Barcha userlarni olish
router.get("/", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Yangi user qo‘shish
router.post("/", async (req, res) => {
    const { name, email } = req.body;
    const newUser = new User({ name, email });
    await newUser.save();
    res.json(newUser);
});

module.exports = router;
