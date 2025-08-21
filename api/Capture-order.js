const paypal = require('@paypal/checkout-server-sdk');

// Setup PayPal environment (same as above)
function environment() {
  let clientId = process.env.PAYPAL_CLIENT_ID;
  let clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return new paypal.core.LiveEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { orderID } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    // Here you would save the transaction to a database and grant user access
    res.status(200).json({ success: true, details: capture.result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
