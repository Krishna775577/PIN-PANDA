/**
 * ImageKit Authentication Server
 * Works with: Express (local/Vercel) and Netlify Functions
 * Run locally: node imagekit-auth.js
 * Deploy: vercel --prod (from server/ folder) OR netlify deploy --prod
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const ImageKit = require('imagekit');

// ========================================
// CONFIGURATION
// ========================================
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
};

// ========================================
// EXPRESS APP (for local & Vercel)
// ========================================
const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'imagekit-auth', timestamp: new Date().toISOString() });
});

// ImageKit Authentication Endpoint
app.all('/api/imagekit-auth', async (req, res) => {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET/POST
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate authentication parameters
    // Token expires in 30 minutes (1800 seconds)
    const expire = parseInt(process.env.AUTH_TOKEN_EXPIRY) || 1800;
    const token = Math.random().toString(36).substring(2, 15);

    const authParams = imagekit.getAuthenticationParameters({ expire, token });

    res.json({
      token: authParams.token,
      expire: authParams.expire,
      signature: authParams.signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({ error: 'Failed to generate auth token' });
  }
});

// ========================================
// SERVER STARTUP
// ========================================
const PORT = process.env.PORT || 3001;

// Only start server if not in serverless environment (Vercel/Netlify)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 ImageKit Auth Server running on http://localhost:${PORT}`);
    console.log(`📡 Auth endpoint: http://localhost:${PORT}/api/imagekit-auth`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    console.log('');
    console.log('Environment:');
    console.log(`  IMAGEKIT_PUBLIC_KEY: ${process.env.IMAGEKIT_PUBLIC_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`  IMAGEKIT_PRIVATE_KEY: ${process.env.IMAGEKIT_PRIVATE_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`  IMAGEKIT_URL_ENDPOINT: ${process.env.IMAGEKIT_URL_ENDPOINT ? '✅ Set' : '❌ Missing'}`);
    console.log(`  FRONTEND_URL: ${process.env.FRONTEND_URL || '*'}`);
  });
}

// Export for serverless platforms (Vercel, Netlify Functions)
module.exports = app;