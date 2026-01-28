import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import cors from "cors";

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- Configuration ---
// These are your live keys. Keep them safe!
const RAZORPAY_KEY_ID = "rzp_live_S9L8m8NsmMhBkm";
const RAZORPAY_KEY_SECRET = "nUM6KoczmG2qaL4MyGCRxWAa";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Health Check Route
app.get("/", (req, res) => {
  res.send("VetCrack Backend is officially LIVE 🚀");
});

// Step 1: Create Order
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount) return res.status(400).json({ error: "Amount required" });

    const options = {
      amount: Math.round(Number(amount) * 100), // Convert INR to Paise
      currency: "INR",
      receipt: `vet_rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    console.error("❌ Order Creation Error:", err);
    res.status(500).json({ error: "Razorpay order failed", details: err });
  }
});

// Step 2: Verify Payment
app.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      console.log("✅ Payment Verified:", razorpay_payment_id);
      res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      console.error("❌ Signature Mismatch");
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("❌ Verification Error:", err);
    res.status(500).json({ error: "Verification process failed" });
  }
});

// --- Smart Port Handling (Prevents sudden stops) ---
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`\n----------------------------------------------`);
    console.log(`🚀 VetCrack Server running at: http://localhost:${port}`);
    console.log(`----------------------------------------------\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} is busy. Trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("❌ Critical Server Error:", err);
    }
  });
};

// Start the process
startServer(3000);

// Global Error Catching (Prevents the "Silent Crash")
process.on('uncaughtException', (err) => {
  console.error('🔥 There was an uncaught error:', err);
});
