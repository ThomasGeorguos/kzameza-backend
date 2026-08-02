const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("=== DB CONNECTION START ===");
  console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
  console.log("MONGO_URI type:", typeof process.env.MONGO_URI);
  console.log("MONGO_URI length:", process.env.MONGO_URI?.length);

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("=== DB CONNECTED SUCCESSFULLY ===");
  } catch (error) {
    console.error("=== DB CONNECTION FAILED ===");
    console.error(error.message);
    throw error;
  }
};

module.exports = connectDB;
