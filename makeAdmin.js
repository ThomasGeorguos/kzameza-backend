// سكريبت لمرة واحدة عشان تحول حساب موجود لـ admin
// طريقة الاستخدام من جوه فولدر الباك اند:
//   node makeAdmin.js the-email@example.com

require("dotenv").config();
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require("mongoose");
const User = require("./models/UserSchema.js");

const email = process.argv[2];

if (!email) {
  console.log("Usage: node makeAdmin.js the-email@example.com");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: "admin" },
      { new: true },
    );

    if (!user) {
      console.log(`No user found with email: ${email}`);
    } else {
      console.log(`Done! ${user.email} is now an admin (role: ${user.role})`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
