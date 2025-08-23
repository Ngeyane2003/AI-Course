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

// Simple in-memory storage for demo purposes (replace with database in production)
const transactions = new Map();

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
    
    const captureResult = capture.result;
    const purchaseUnit = captureResult.purchase_units[0];
    const payer = captureResult.payer;
    
    // Store transaction details (in production, save to database)
    const transactionData = {
      id: captureResult.id,
      status: captureResult.status,
      create_time: captureResult.create_time,
      update_time: captureResult.update_time,
      amount: purchaseUnit.amount,
      description: purchaseUnit.description,
      custom_id: purchaseUnit.custom_id,
      payer: {
        name: payer.name,
        email: payer.email_address,
        payer_id: payer.payer_id
      },
      shipping: purchaseUnit.shipping,
      links: captureResult.links
    };
    
    transactions.set(captureResult.id, transactionData);
    
    console.log('Order captured successfully:', captureResult.id);
    
    // Here you would:
    // 1. Save to your database
    // 2. Grant user access to the course
    // 3. Send confirmation email
    // 4. Update your analytics
    
    res.status(200).json({ 
      success: true, 
      id: captureResult.id,
      status: captureResult.status,
      create_time: captureResult.create_time,
      amount: purchaseUnit.amount,
      description: purchaseUnit.description,
      course_id: purchaseUnit.custom_id,
      payer: {
        name: payer.name,
        email: payer.email_address
      }
    });
    
  } catch (err) {
    console.error('Capture order error:', err);
    
    // More specific error handling
    if (err.statusCode) {
      res.status(err.statusCode).json({ 
        error: 'PayPal API error: ' + (err.message || 'Unknown error'),
        details: err.details
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to capture order: ' + err.message 
      });
    }
  }
};
