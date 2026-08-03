const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db.js");
const usersRouter = require("./routes/users.js");
const adminRouter = require("./routes/admin.js");
const productRouter = require("./routes/products.js");
const categoryRouter = require("./routes/category.js");
const cartRouter = require("./routes/cart.js");
const orderRouter = require("./routes/orders.js");
const contactRouter = require("./routes/contact.js");
const heroSlideRouter = require("./routes/heroSlides.js");
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
connectDB();
const allowedOrigins = [
  "http://localhost:5173",
  "https://kzameza-gamma.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/products", productRouter);
app.use("/category", categoryRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/contact", contactRouter);
app.use("/hero-slides", heroSlideRouter);

// Error handler عام: أي خطأ (زي فشل رفع الصورة على Cloudinary) يرجع JSON بدل صفحة HTML
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
