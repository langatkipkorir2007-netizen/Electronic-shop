const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/api/create-mpesa-payment', async (req, res) => {
    try {
        const { amount, phoneNumber, email } = req.body;

        // Ensure phone number starts with 254 (e.g., 254712345678)
        let formattedPhone = phoneNumber.trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.slice(1);
        }

        const response = await axios.post(
            'https://api.intasend.com/api/v1/payment/mpesa-stk-push/',
            {
                amount: amount,
                phone_number: formattedPhone,
                email: email || 'customer@example.com',
                api_ref: `ORDER-${Date.now()}`
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.INTASEND_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: 'STK Push sent! Ask customer to enter M-Pesa PIN.',
            data: response.data
        });

    } catch (error) {
        console.error('Payment Error:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            error: error.response?.data || error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
