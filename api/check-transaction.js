const paypal = require('@paypal/checkout-server-sdk');

// Setup PayPal environment (same as above)
function environment() {
  let clientId = process.env.Client_ID;
  let clientSecret = process.env.Secret_key_1;
  
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.query;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Missing orderId parameter' });
    }

    const request = new paypal.orders.OrdersGetRequest(orderId);
    const order = await client().execute(request);
    
    res.status(200).json({ 
      order: order.result 
    });
    
  } catch (err) {
    console.error('Check transaction error:', err);
    
    if (err.statusCode) {
      res.status(err.statusCode).json({ 
        error: 'PayPal API error: ' + (err.message || 'Unknown error')
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to check transaction: ' + err.message 
      });
    }
  }
};
