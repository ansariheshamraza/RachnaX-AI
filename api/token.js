export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessToken = process.env.ACCESS_TOKEN;
  
  if (!accessToken) {
    return res.status(500).json({ error: 'Token not configured' });
  }

  // Return obfuscated token
  const obfuscated = Buffer.from(accessToken).toString('base64');
  
  return res.status(200).json({ t: obfuscated });
}
