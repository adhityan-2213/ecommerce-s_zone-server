const serverless = require("serverless-http");
const app = require("../server");

console.log("🚀 Serverless handler initialized");

module.exports = serverless(app);



