const paypal = require('@paypal/checkout-server-sdk');

// Setup PayPal environment
function environment() {
  let clientId = process.env.Client_ID;
  let clientSecret = process.env.Secret_key_1;
  
  // Use sandbox for development, live for production
  if (process.env.NODE_ENV !== 'production') {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
  return new paypal.core.LiveEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { value, description } = req.body;
    
    // Validate input
    if (!value || !description) {
      return res.status(400).json({ error: 'Missing value or description' });
    }

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

    const order = await client().execute(request);
    res.status(200).json({ id: order.result.id });
    
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order: ' + err.message });
  }
};
