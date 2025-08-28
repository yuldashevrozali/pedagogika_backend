const mongoose = require("mongoose");
const Test = require("./models/test");
const tests = require("./data/tests.json");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log("MongoDB ulandi");
    
    await Test.deleteMany({}); // eski testlarni tozalash
    await Test.insertMany(tests); // barcha testlarni qo‘shish
    
    console.log("✅ Testlar bazaga qo‘shildi");
    mongoose.disconnect();
})
.catch(err => console.error(err));
