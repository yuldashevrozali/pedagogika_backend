const express = require("express");
const router = express.Router();
const Test = require("../models/test");

// Barcha testlar yoki bo‘lim bo‘yicha
router.get("/", async (req, res) => {
    const section = req.query.section; // masalan: ?section=2024_kuz
    let tests;
    if(section){
        tests = await Test.find({ section });
    } else {
        tests = await Test.find();
    }
    res.json(tests);
});

// Yangi test qo‘shish
router.post("/", async (req, res) => {
    const { section, question, options, answer } = req.body;
    const newTest = new Test({ section, question, options, answer });
    await newTest.save();
    res.json(newTest);
});

module.exports = router;
