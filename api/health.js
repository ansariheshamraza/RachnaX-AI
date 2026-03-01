// Health check endpoint to verify API is working
export default async function handler(req, res) {
  return res.status(200).json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    env: {
      nodeVersion: process.version
    }
  });
}

