const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

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
const INITIAL_PORT = parseInt(process.env.PORT, 10) || 5000;

// MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((error) => console.log(error));

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ecommerce-s-zone-client.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
  })
);

app.use(cookieParser());
app.use(express.json());

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
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

// Root Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// MongoDB Test Route
app.get("/api/test-db", (req, res) => {
  res.json({
    mongoState: mongoose.connection.readyState,
    message:
      mongoose.connection.readyState === 1
        ? "MongoDB Connected"
        : "MongoDB Not Connected",
  });
});

// Local Development Only
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server is now running on port ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.warn(
        `Port ${port} is already in use. Trying port ${port + 1}...`
      );
      startServer(port + 1);
    } else {
      console.error(error);
      process.exit(1);
    }
  });
};

if (process.env.NODE_ENV !== "production") {
  startServer(INITIAL_PORT);
}

app.get("/api/check-env", (req, res) => {
  res.json({
    hasMongoUri: !!process.env.MONGO_URI,
    mongoUriStart: process.env.MONGO_URI?.substring(0, 40),
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("FULL MONGODB ERROR:", err);
  });

// Export for Vercel
module.exports = app;