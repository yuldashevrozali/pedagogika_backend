const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  totalCorrect: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  totalWrong: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  details: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true
    },
    selectedAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);