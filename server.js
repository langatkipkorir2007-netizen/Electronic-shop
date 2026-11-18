const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/', (req, res) => {
    res.send('KiliShop Server is running!');
});

// Optional: Endpoint to handle order confirmation or logging after payment
app.post('/api/verify-payment', (req, res) => {
    const { reference, amount, customer } = req.body;
    // Here you can verify with Paystack API or save order to database
    console.log(`Payment received: ${reference} for amount ${amount}`);
    res.json({ status: 'success', message: 'Order recorded successfully' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
