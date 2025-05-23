
import React from 'react';
import { LiveKitProvider } from '@/context/LiveKitContext';
import Host from '@/components/Host';

const Index = () => {
  return (
    <LiveKitProvider>
      <Host />
    </LiveKitProvider>
  );
};

export default Index;
