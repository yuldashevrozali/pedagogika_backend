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

// ✅ User Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
    password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });

const User = mongoose.model("user", userSchema);

// Oddiy route
app.get("/", (req, res) => {
    res.send("API ishlayapti 🚀");
});

// ====================== AUTH ROUTES ======================

// 📌 SIGN UP
app.post("/api/users/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log("📥 Sign Up request keldi:", req.body);

        // mavjud userni tekshirish
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("❌ Email oldin ro‘yxatdan o‘tgan:", email);
            return res.status(400).json({ msg: "Email already registered" });
        }

        // parolni hashlash
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        console.log("✅ User ro‘yxatdan o‘tdi:", newUser.username);
        res.status(201).json({ msg: "User registered successfully" });
    } catch (err) {
        console.error("❌ Sign Up xato:", err);
        res.status(500).json({ error: err.message });
    }
});

// 📌 SIGN IN
app.post("/api/users/signin", async (req, res) => {
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
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        console.log("✅ User login qildi:", user.username);

        res.json({
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        console.error("❌ Sign In xato:", err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================================

// MongoDB ulanish va server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ MongoDB ulandi");

        app.listen(PORT, () => {
            console.log(`✅ Server ${PORT} portda ishlayapti`);
        });
    } catch (err) {
        console.error("❌ MongoDB xato:", err);
        process.exit(1); // serverni to‘xtatish
    }
};

startServer();
