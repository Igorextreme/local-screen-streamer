
import React, { useState, useEffect } from 'react';
import { useLiveKit } from '../context/LiveKitContext';
import { generateToken } from '../services/api';
import { Track } from 'livekit-client';
import { Card } from '@/components/ui/card';

const Viewer: React.FC = () => {
  const { room, isConnected, connectToRoom } = useLiveKit();
  const [error, setError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const connectAsViewer = async () => {
      try {
        // Generate a unique viewer ID
        const viewerId = 'viewer-' + Date.now();
        const token = await generateToken(viewerId, 'Viewer', 'viewer');
        await connectToRoom(token);
      } catch (error) {
        console.error('Failed to connect as viewer:', error);
        setError('Failed to connect to the stream. Please try again later.');
      }
    };

    if (!isConnected) {
      connectAsViewer();
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [connectToRoom, isConnected]);

  useEffect(() => {
    if (!room) return;

    const handleTrackSubscribed = (track: Track) => {
      if (track.source === Track.Source.ScreenShare && videoRef.current) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(track.mediaStreamTrack);
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(error => console.error('Failed to play video:', error));
      }
    };

    const handleTrackUnsubscribed = () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    room.on('trackSubscribed', handleTrackSubscribed);
    room.on('trackUnsubscribed', handleTrackUnsubscribed);

    // Initial check for existing tracks
    room.participants.forEach(participant => {
      participant.trackPublications.forEach(publication => {
        if (
          publication.track && 
          publication.source === Track.Source.ScreenShare &&
          videoRef.current
        ) {
          const mediaStream = new MediaStream();
          mediaStream.addTrack(publication.track.mediaStreamTrack);
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(error => console.error('Failed to play video:', error));
        }
      });
    });

    return () => {
      room.off('trackSubscribed', handleTrackSubscribed);
      room.off('trackUnsubscribed', handleTrackUnsubscribed);
    };
  }, [room]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Viewing Shared Screen</h1>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-4 w-full max-w-4xl">
          {error}
        </div>
      )}

      <Card className="bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl overflow-hidden">
        <div className="aspect-video bg-black flex items-center justify-center">
          {!isConnected ? (
            <p className="text-gray-400">Connecting to stream...</p>
          ) : (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default Viewer;
