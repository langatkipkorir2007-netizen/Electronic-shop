const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Enable CORS so your GitHub Pages frontend can talk to it
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
});

const PESAPAL_BASE_URL = 'https://cybqa.pesapal.com/pesapalv3/api';
const CONSUMER_KEY = 'qkio1DGGYAkTu2JDNe74SXnruzZerqTK';
const CONSUMER_SECRET = 'osQ3G4R49CKaDYSpaDn1+rtls=';

async function getPesapalToken() {
  try {
    const response = await axios.post(`${PESAPAL_BASE_URL}/Auth/RequestToken`, {
      consumer_key: CONSUMER_KEY,
      consumer_secret: CONSUMER_SECRET
    }, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    });
    return response.data.token;
  } catch (error) {
    console.error('Token Error:', error.response?.data || error.message);
    throw error;
  }
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
        callback_url: 'https://your-callback-url.com',
        notification_id: 'YOUR_REGISTERED_IPN_ID',
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
    return res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
