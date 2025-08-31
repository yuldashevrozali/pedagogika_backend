const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/user"); // models papkangdagi user.js manzilini to‘g‘rilab ol

const resetIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB ulandi");

    // Eski indexlarni o‘chirib tashlash
    await User.collection.dropIndexes();
    console.log("🗑️ Indexlar o‘chirildi");

    // Modeldagi yangi indexlarni yaratish
    await User.syncIndexes();
    console.log("✅ Yangi indexlar yaratildi");

    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Xato:", err);
    process.exit(1);
  }
};

resetIndexes();
