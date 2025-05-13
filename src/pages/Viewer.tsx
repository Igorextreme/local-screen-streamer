
import React from 'react';
import { LiveKitProvider } from '@/context/LiveKitContext';
import Viewer from '@/components/Viewer';

const ViewerPage = () => {
  return (
    <LiveKitProvider>
      <Viewer />
    </LiveKitProvider>
  );
};

export default ViewerPage;
