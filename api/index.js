// Minimal test handler
module.exports = (req, res) => {
	console.log("Handler called for:", req.method, req.path);
	
	if (req.path === "/api/test-simple") {
		return res.status(200).json({
			success: true,
			message: "Simple test endpoint works!",
			time: new Date().toISOString(),
		});
	}
	
	// Try loading the Express app
	try {
		const app = require("../server");
		console.log("Express app loaded successfully");
		return app(req, res);
	} catch (err) {
		console.error("Error loading Express app:", err.message);
		return res.status(500).json({
			success: false,
			message: "Failed to load server: " + err.message,
		});
	}
};



