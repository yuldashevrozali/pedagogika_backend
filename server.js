const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes import
const userRoutes = require("./routes/userRoutes");
const testRoutes = require("./routes/testRoutes");

// Oddiy route
app.get("/", (req, res) => {
    res.send("API ishlayapti 🚀");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tests", testRoutes);

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
