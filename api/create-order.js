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
    const { value, description, courseId } = req.body;
    
    // Validate input
    if (!value || isNaN(parseFloat(value))) {
      return res.status(400).json({ error: 'Valid numeric value is required' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    
    const requestBody = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: parseFloat(value).toFixed(2)
        },
        description: description,
        custom_id: courseId || 'ai-course' // Store course ID for reference
      }],
      application_context: {
        brand_name: "Learn & Earn AI",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/courses`
      }
    };

    request.requestBody(requestBody);

    const order = await client().execute(request);
    
    console.log('Order created successfully:', order.result.id);
    
    res.status(200).json({ 
      id: order.result.id,
      status: order.result.status,
      create_time: order.result.create_time
    });
    
  } catch (err) {
    console.error('Create order error:', err);
    
    // More specific error handling
    if (err.statusCode) {
      res.status(err.statusCode).json({ 
        error: 'PayPal API error: ' + (err.message || 'Unknown error'),
        details: err.details
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to create order: ' + err.message 
      });
    }
  }
};
