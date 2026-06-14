const serverless = require("serverless-http");
const app = require("../server");
const connectDB = require("../db");

console.log("API Handler - NODE_ENV:", process.env.NODE_ENV);
console.log("API Handler - MONGO_URI exists:", !!process.env.MONGO_URI);

const handler = serverless(app);

module.exports = async (req, res) => {
	try {
		if (!global.__dbConnected) {
			console.log("Connecting to MongoDB from serverless handler...");
			try {
				await connectDB();
				global.__dbConnected = true;
				console.log("✅ DB Connected in serverless handler");
			} catch (err) {
				console.error('❌ Failed to connect to DB in serverless wrapper:', err.message);
				return res.status(500).json({
					success: false,
					message: 'Database connection error: ' + err.message,
					mongoState: 0,
				});
			}
		}

		return handler(req, res);
	} catch (error) {
		console.error('❌ Serverless handler error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error: ' + error.message,
		});
	}
};

