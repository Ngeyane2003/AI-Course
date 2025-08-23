export default async function handler(req, res) {
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
    // Return the Client ID from environment variables
    res.status(200).json({ 
      clientId: process.env.Client_ID 
    });
  } catch (error) {
    console.error('Error getting client ID:', error);
    res.status(500).json({ error: 'Failed to retrieve client ID' });
  }
}
