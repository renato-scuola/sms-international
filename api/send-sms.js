// Vercel serverless function for SMS sending with IP rotation
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }
    
    console.log('Sending SMS from Vercel function...');
    console.log('Server IP will be different for each deployment region');
    
    // Use different Textbelt endpoints to simulate IP rotation
    const textbeltEndpoints = [
      'https://textbelt.com/text',
      'https://api.textbelt.com/text'
    ];
    
    const randomEndpoint = textbeltEndpoints[Math.floor(Math.random() * textbeltEndpoints.length)];
    
    const formData = new URLSearchParams({
      phone: phone,
      message: message,
      key: 'textbelt'
    });
    
    const response = await fetch(randomEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': `VercelSMS/${Date.now()}`,
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('Textbelt response:', result);
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('SMS sending error:', error);
    return res.status(500).json({ 
      error: 'Failed to send SMS',
      details: error.message 
    });
  }
}
