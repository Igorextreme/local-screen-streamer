
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, RoomEvent } from 'livekit-client';

interface LiveKitContextProps {
  room: Room | null;
  isConnected: boolean;
  viewerCount: number;
  connectToRoom: (token: string) => Promise<void>;
  disconnectFromRoom: () => void;
}

const LiveKitContext = createContext<LiveKitContextProps>({
  room: null,
  isConnected: false,
  viewerCount: 0,
  connectToRoom: async () => {},
  disconnectFromRoom: () => {},
});

export const useLiveKit = () => useContext(LiveKitContext);

export const LiveKitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [room] = useState<Room>(() => new Room());
  const [isConnected, setIsConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    const handleParticipantsChanged = () => {
      // Count all participants except the local one
      const count = room.participants.size;
      setViewerCount(count);
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantsChanged);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantsChanged);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantsChanged);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantsChanged);
    };
  }, [room]);

  const connectToRoom = async (token: string) => {
    try {
      await room.connect(process.env.LIVEKIT_WS_URL || 'ws://localhost:7880', token);
      console.log('Connected to LiveKit room:', room.name);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to LiveKit room:', error);
      throw error;
    }
  };

  const disconnectFromRoom = () => {
    room.disconnect();
    setIsConnected(false);
    console.log('Disconnected from LiveKit room');
  };

  return (
    <LiveKitContext.Provider
      value={{
        room,
        isConnected,
        viewerCount,
        connectToRoom,
        disconnectFromRoom,
      }}
    >
      {children}
    </LiveKitContext.Provider>
  );
};
