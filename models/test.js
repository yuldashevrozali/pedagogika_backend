const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    section: { type: String, required: true }, // bo‘lim nomi
    question: { type: String, required: true }, // savol matni
    options: [{ type: String, required: true }], // variantlar
    answer: { type: String, required: true } // to‘g‘ri javob
});

module.exports = mongoose.model("Test", testSchema);
