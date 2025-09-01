const express = require("express");
const router = express.Router();
const Result = require("../models/result");
const Test = require("../models/test");
const authMiddleware = require("../middlewares/auth");

// POST /api/results - Save test results
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { answers } = req.body; // answers: [{testId, selectedAnswer}, ...]
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers) || answers.length !== 10) {
      return res.status(400).json({ success: false, message: "10 ta javob kerak" });
    }

    // Fetch all tests to check answers
    const testIds = answers.map(a => a.testId);
    const tests = await Test.find({ _id: { $in: testIds } });

    if (tests.length !== 10) {
      return res.status(400).json({ success: false, message: "Testlar topilmadi" });
    }

    // Create a map for quick lookup
    const testMap = {};
    tests.forEach(test => {
      testMap[test._id.toString()] = test;
    });

    let totalCorrect = 0;
    let totalWrong = 0;
    const details = [];

    answers.forEach(answer => {
      const test = testMap[answer.testId];
      if (!test) {
        return res.status(400).json({ success: false, message: `Test ${answer.testId} topilmadi` });
      }

      const isCorrect = test.answer === answer.selectedAnswer;
      if (isCorrect) {
        totalCorrect++;
      } else {
        totalWrong++;
      }

      details.push({
        testId: answer.testId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      });
    });

    // Save the result
    const newResult = new Result({
      user: userId,
      totalCorrect,
      totalWrong,
      details
    });

    await newResult.save();

    res.status(201).json({
      success: true,
      message: "Natijalar saqlandi",
      result: {
        id: newResult._id,
        totalCorrect,
        totalWrong,
        details
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/results - Get user's results
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await Result.find({ user: userId }).populate('details.testId', 'question options answer').sort({ createdAt: -1 });

    res.json({
      success: true,
      results
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;