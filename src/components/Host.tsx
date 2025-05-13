
import React, { useState, useEffect } from 'react';
import { useLiveKit } from '../context/LiveKitContext';
import { getLocalIp, generateToken } from '../services/api';
import { Track } from 'livekit-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Host: React.FC = () => {
  const { room, isConnected, viewerCount, connectToRoom, disconnectFromRoom } = useLiveKit();
  const [localIp, setLocalIp] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocalIp = async () => {
      try {
        const ip = await getLocalIp();
        setLocalIp(ip);
      } catch (error) {
        console.error('Failed to get local IP:', error);
        setError('Failed to get local IP address. Make sure the server is running.');
      }
    };
    
    fetchLocalIp();
  }, []);

  const startScreenShare = async () => {
    try {
      if (!isConnected) {
        // Connect to LiveKit room
        const token = await generateToken(
          'host-' + Date.now(),
          'Host',
          'host'
        );
        await connectToRoom(token);
      }

      // Request screen share permissions
      const screenTrack = await room?.localParticipant.createScreenShareTrack({
        audio: false,
      });
      
      if (screenTrack) {
        await room?.localParticipant.publishTrack(screenTrack);
        setIsSharing(true);
      }
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      setError('Failed to start screen sharing. Please try again.');
    }
  };

  const stopScreenShare = async () => {
    try {
      // Unpublish screen share track
      room?.localParticipant.tracks.forEach((publication) => {
        if (publication.source === Track.Source.ScreenShare) {
          room.localParticipant.unpublishTrack(publication.track);
        }
      });
      setIsSharing(false);
    } catch (error) {
      console.error('Failed to stop screen sharing:', error);
      setError('Failed to stop screen sharing. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Host Screen Sharing</h1>
      
      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-4 w-full max-w-2xl">
          {error}
        </div>
      )}

      <Card className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="space-y-6">
          {!isSharing ? (
            <Button 
              className="w-full py-3 text-xl"
              onClick={startScreenShare}
            >
              Start Screen Sharing
            </Button>
          ) : (
            <Button 
              variant="destructive" 
              className="w-full py-3 text-xl"
              onClick={stopScreenShare}
            >
              Stop Screen Sharing
            </Button>
          )}

          {isSharing && (
            <div className="mt-4">
              <p className="text-green-400 font-semibold">Screen sharing is active!</p>
              <p className="text-sm text-gray-300 mt-1">Viewers connected: {viewerCount}</p>
            </div>
          )}

          {localIp && (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Share this link with viewers on your network:</p>
              <p className="font-mono bg-gray-900 p-3 rounded break-all">
                http://{localIp}:8080/viewer
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Host;
