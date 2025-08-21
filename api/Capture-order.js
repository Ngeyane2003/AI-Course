const paypal = require('@paypal/checkout-server-sdk');

// Setup PayPal environment
function environment() {
  let clientId = process.env.PAYPAL_CLIENT_ID;
  let clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  return new paypal.core.LiveEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end(); // Only allow POST requests

  const { value, description } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: value
      },
      description: description
    }]
  });

  try {
    const order = await client().execute(request);
    res.status(200).json({ id: order.result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
