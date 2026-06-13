const serverless = require("serverless-http");
const app = require("../server");
const connectDB = require("../db");

const handler = serverless(app);

module.exports = async (req, res) => {
	if (!global.__dbConnected) {
		try {
			await connectDB();
			global.__dbConnected = true;
		} catch (err) {
			console.error('Failed to connect to DB in serverless wrapper:', err);
			// Return a 500 here so Vercel shows a meaningful runtime error
			res.statusCode = 500;
			res.end('Database connection error');
			return;
		}
	}

	return handler(req, res);
};
