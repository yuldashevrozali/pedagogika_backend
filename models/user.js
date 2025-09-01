const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: /^\+[0-9]{9,15}$/, // + bilan boshlanadi, keyin 9–15 raqam
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
