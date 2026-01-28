import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

// 🔴 Put your LIVE keys here
const razorpay = new Razorpay({
  key_id: "rzp_live_S9L8m8NsmMhBkm",
  key_secret: "nUM6KoczmG2qaL4MyGCRxWAa",
});

app.get("/", (req, res) => {
  res.send("Razorpay backend running 🚀");
});

app.post("/create-order", async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ error: "Order failed" });
  }
});

app.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", "nUM6KoczmG2qaL4MyGCRxWAa")
      .update(sign)
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      res.json({ success: true, message: "Payment verified ✅" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature ❌" });
    }
  } catch (err) {
    console.error("Verify Error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
