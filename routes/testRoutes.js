const express = require("express");
const router = express.Router();
const Test = require("../models/test");

// Barcha testlar yoki bo‘lim bo‘yicha
router.get("/", async (req, res) => {
    try {
        const section = req.query.section; // masalan: ?section=2024_kuz
        let tests;
        if(section){
            tests = await Test.find({ section });
        } else {
            tests = await Test.find();
        }
        res.json(tests);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Yangi test qo‘shish
router.post("/", async (req, res) => {
    try {
        const { section, question, options, answer } = req.body;
        const newTest = new Test({ section, question, options, answer });
        await newTest.save();
        res.json(newTest);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
