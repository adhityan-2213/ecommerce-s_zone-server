const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./db");
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

let mongooseConnectionPromise = null;

async function ensureDbConnection() {
  if (mongoose.connection.readyState === 1) return;
  if (!mongooseConnectionPromise) {
    mongooseConnectionPromise = connectDB().catch((err) => {
      console.error("❌ MongoDB Connection Error:", err.message);
      mongooseConnectionPromise = null;
      throw err;
    });
  }
  await mongooseConnectionPromise;
}

// Attempt an initial connection, but do not block startup entirely.
ensureDbConnection().catch(() => {});

/* =========================
   Middleware
========================= */

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://ecommerce-s-zone-client.vercel.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

app.use(async (req, res, next) => {
  if (req.path.startsWith("/api")) {
    try {
      await ensureDbConnection();
    } catch (err) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Please try again later.",
      });
    }
  }
  next();
});

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