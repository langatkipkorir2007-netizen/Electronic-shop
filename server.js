const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Pesapal Sandbox URL (ensure it ends with /api)
// For live production, change to: https://pay.pesapal.com/v3/api
const PESAPAL_BASE_URL = 'https://cybqa.pesapal.com/pesapalv3/api';

async function getPesapalToken() {
    const response = await axios.post(`${PESAPAL_BASE_URL}/Auth/RequestToken`, {
        consumer_key: process.env.PESAPAL_CONSUMER_KEY,
        consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    });
    return response.data.token;
}

app.post('/api/create-pesapal-order', async (req, res) => {
    try {
        const { amount, email, phoneNumber, orderId } = req.body;
        const token = await getPesapalToken();

        const orderResponse = await axios.post(
            `${PESAPAL_BASE_URL}/Transactions/SubmitOrderRequest`,
            {
                id: orderId || `KILIMALL-${Date.now()}`,
                currency: 'KES',
                amount: amount,
                description: 'Payment for Kilimall Order',
                callback_url: 'https://your-callback-url.com', // <-- REPLACE with your actual redirect URL
                notification_id: 'YOUR_REGISTERED_IPN_ID',       // <-- REPLACE with your actual Pesapal IPN ID
billing_address: {
    email_address: email || 'customer@example.com',
    phone_number: phoneNumber
}

            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        return res.status(200).json({
            success: true,
            redirect_url: orderResponse.data.redirect_url
        });

    } catch (error) {
        console.error('Order Error:', error.response?.data || error.message);
        return res.status(500).json({ 
            success: false, 
            error: error.response?.data || error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));