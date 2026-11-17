
const express = require("express");
const app = express();

app.use(express.json());

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Replace these demo functions with a persistent database.
const orders = new Map();

app.post("/api/paystack/initialize", async (req, res) => {
  try {
    const { email, amount, orderId } = req.body;

    if (!email || !orderId || !Number.isInteger(amount) ||
        amount <= 0) {
      return res.status(400).json({ message: "Invalid order" });
    }

    // In production, retrieve the order from your database
    // and calculate its deposit on the server.
    const order = orders.get(orderId);

    if (!order || amount !== order.deposit * 100) {
      return res.status(400).json({ message: "Order validation failed" });
    }

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          amount,
          currency: "KES",
          metadata: { orderId }
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return res.status(400).json({ message: data.message });
    }

    res.json(data.data);
  } catch {
    res.status(500).json({ message: "Payment initialization failed" });
  }
});

app.post("/api/paystack/verify", async (req, res) => {
  try {
    const { reference, orderId } = req.body;
    const order = orders.get(orderId);

    if (!order || !reference) {
      return res.status(400).json({ paid: false });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = await response.json();

    if (
      data.status &&
      data.data.status === "success" &&
      data.data.amount === order.deposit * 100 &&
      data.data.currency === "KES" &&
      data.data.metadata.orderId === orderId
    ) {
      order.paid = true;
      order.reference = reference;

      return res.json({ paid: true });
    }

    res.json({ paid: false });
  } catch {
    res.status(500).json({ paid: false });
  }
});

app.listen(3000, () => {
  console.log("Kilishop payment server running");
});
