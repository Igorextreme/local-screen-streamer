
import { toast } from "@/hooks/use-toast";

// Get local IP address from server
export const getLocalIp = async (): Promise<string> => {
  try {
    const response = await fetch('http://localhost:3001/api/local-ip');
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get local IP:', error);
    toast({
      title: "Server Connection Error",
      description: "Cannot connect to local server. Make sure to run 'node start.js' first.",
      variant: "destructive",
    });
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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error generating token:', error);
    toast({
      title: "Connection Error",
      description: "Failed to generate LiveKit token. Make sure the server is running with 'node start.js'.",
      variant: "destructive",
    });
    throw error;
  }
};
