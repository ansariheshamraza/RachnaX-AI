export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const expectedToken = process.env.ACCESS_TOKEN;
  
  if (!expectedToken) {
    console.error('ACCESS_TOKEN environment variable not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Support both POST (production) and GET (admin testing)
  if (req.method === 'GET') {
    // Admin testing via URL: /api/endpoint?token=YOUR_ACCESS_TOKEN
    const urlToken = req.query.token;
    
    if (!urlToken || urlToken !== expectedToken) {
      return res.status(403).json({ 
        error: 'Forbidden',
        hint: 'Use: /api/endpoint?token=YOUR_ACCESS_TOKEN'
      });
    }

    // Return decoded response for admin
    const endpoint = String.fromCharCode(47, 97, 112, 105, 47, 103, 101, 110, 101, 114, 97, 116, 101);
    const method = String.fromCharCode(80, 79, 83, 84);
    const headerKey = String.fromCharCode(67, 111, 110, 116, 101, 110, 116, 45, 84, 121, 112, 101);
    const headerValue = String.fromCharCode(97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 106, 115, 111, 110);

    return res.status(200).json({
      message: 'Admin view - decoded configuration',
      config: {
        endpoint: endpoint,
        method: method,
        headers: {
          [headerKey]: headerValue
        }
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed - Invalid token' });
  }

  // Production POST request validation
  const token = req.headers['x-request-token'];
  
  if (!token || token !== expectedToken) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Validate request body
  const { v } = req.body;
  if (!v || v !== 'v1') {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const _0x1a2b = String.fromCharCode(47, 97, 112, 105, 47, 103, 101, 110, 101, 114, 97, 116, 101);
  const _0x3c4d = String.fromCharCode(80, 79, 83, 84);
  const _0x5e6f = String.fromCharCode(67, 111, 110, 116, 101, 110, 116, 45, 84, 121, 112, 101);
  const _0x7g8h = String.fromCharCode(97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 106, 115, 111, 110);

  // Further obfuscate the response
  const encoded = Buffer.from(JSON.stringify({
    e: _0x1a2b,
    m: _0x3c4d,
    h: { [_0x5e6f]: _0x7g8h }
  })).toString('base64');

  return res.status(200).json({ d: encoded });
}
