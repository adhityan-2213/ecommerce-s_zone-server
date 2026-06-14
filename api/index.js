const serverless = require("serverless-http");
const app = require("../server");
const connectDB = require("../db");

let isDbConnecting = false;
let dbConnected = false;

const handler = serverless(app);

module.exports = async (req, res) => {
	// Ensure MongoDB is connected before processing request
	if (!dbConnected && !isDbConnecting) {
		isDbConnecting = true;
		try {
			console.log("Connecting to MongoDB...");
			await connectDB();
			dbConnected = true;
			console.log("✅ MongoDB connected successfully");
		} catch (err) {
			console.error("❌ Failed to connect to MongoDB:", err.message);
			isDbConnecting = false;
			return res.status(500).json({
				success: false,
				message: "Database connection failed",
				error: err.message,
			});
		}
	}

	// Wait for connection if currently connecting
	if (!dbConnected) {
		let waitCount = 0;
		while (!dbConnected && waitCount < 50) {
			await new Promise(resolve => setTimeout(resolve, 100));
			waitCount++;
		}

		if (!dbConnected) {
			console.error("❌ Database connection timeout");
			return res.status(500).json({
				success: false,
				message: "Database connection timeout",
			});
		}
	}

	// Process the request through Express
	return handler(req, res);
};



