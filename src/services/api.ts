
// Get local IP address from server
export const getLocalIp = async (): Promise<string> => {
  try {
    const response = await fetch('http://localhost:3001/api/local-ip');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get local IP:', error);
    return 'localhost';
  }
};

// Generate LiveKit token
export const generateToken = async (
  identity: string,
  name: string,
  role: 'host' | 'viewer'
): Promise<string> => {
  try {
    const response = await fetch('http://localhost:3001/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identity, name, role }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate token');
    }
    
    return data.token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};
