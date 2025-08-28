const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB ulanish
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB ulandi"))
.catch(err => console.error("❌ MongoDB xato:", err));

// Oddiy route
app.get("/", (req, res) => {
    res.send("API ishlayapti 🚀");
});
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const testRoutes = require("./routes/testRoutes");
app.use("/api/tests", testRoutes);


// Serverni ishga tushirish
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server ${PORT} portda ishlayapti`);
});
