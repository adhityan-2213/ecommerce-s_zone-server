const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

// Debug: Log environment
console.log("📝 Environment Debug:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("  JWT_SECRET exists:", !!process.env.JWT_SECRET_KEY);

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");

const commonFeatureRouter = require("./routes/common/feature-routes");

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   MongoDB Connection
========================= */

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    // Don't throw - let the app start and return errors on DB calls
  });

/* =========================
   Middleware
========================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ecommerce-s-zone-client.vercel.app",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

/* =========================
   Static Files
========================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================
   Routes
========================= */

app.use("/api/auth", authRouter);

app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);

app.use("/api/common/feature", commonFeatureRouter);

/* =========================
   Health Check
========================= */

app.get("/", (req, res) => {
  res.send("Server is running...");
});

/* =========================
   MongoDB Test Route
========================= */

app.get("/api/test-db", (req, res) => {
  res.json({
    mongoState: mongoose.connection.readyState,
    dbName: mongoose.connection.name || "Not Connected",
    host: mongoose.connection.host || "Not Connected",
    message:
      mongoose.connection.readyState === 1
        ? "MongoDB Connected"
        : "MongoDB Not Connected",
  });
});

/* =========================
   DB Status Route
========================= */

app.get("/api/db-status", (req, res) => {
  res.json({
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
  });
});

/* =========================
   Local Development
========================= */

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server is now running on port ${PORT}`);
  });
}

  //  Export for Vercel

module.exports = app;