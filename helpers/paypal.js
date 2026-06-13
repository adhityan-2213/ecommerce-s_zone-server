const paypal = require("paypal-rest-sdk");

const mode = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
const clientId = process.env.PAYPAL_CLIENT_ID || "";
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";

try {
  paypal.configure({
    mode,
    client_id: clientId,
    client_secret: clientSecret,
  });
} catch (err) {
  console.error("Paypal configuration error (non-fatal):", err.message);
}

module.exports = paypal;