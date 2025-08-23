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
    const { orderID } = req.body;
    
    // Validate input
    if (!orderID) {
      return res.status(400).json({ error: 'Missing orderID' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.prefer("return=representation");
    request.requestBody({});

    const capture = await client().execute(request);
    
    // Here you would save the transaction to a database and grant user access
    res.status(200).json({ 
      success: true, 
      id: capture.result.id,
      status: capture.result.status,
      payer: capture.result.payer,
      details: capture.result
    });
    
  } catch (err) {
    console.error('Capture order error:', err);
    res.status(500).json({ error: 'Failed to capture order: ' + err.message });
  }
};
