
const express = require('express');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
const os = require('os');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

// Get local IP address
const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over non-IPv4 and internal (loopback) addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; // Fallback
};

// API endpoint to get local IP
app.get('/api/local-ip', (req, res) => {
  res.json({ ip: getLocalIpAddress() });
});

// API endpoint to generate token
app.post('/api/token', (req, res) => {
  try {
    const { identity, name, role } = req.body;
    
    if (!identity || !name) {
      return res.status(400).json({ error: 'Missing identity or name' });
    }
    
    const roomName = 'sala-local';
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
      name,
    });
    
    at.addGrant({ 
      roomJoin: true, 
      room: roomName,
      canPublish: role === 'host',
      canSubscribe: true
    });
    
    const token = at.toJwt();
    res.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Local IP: http://${getLocalIpAddress()}:${PORT}`);
});
