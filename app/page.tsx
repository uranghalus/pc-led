'use client';

import { useState, useEffect } from 'react';

type RelayStatus = {
  relay1: 'on' | 'off';
  relay2: 'on' | 'off';
};

const Home: React.FC = () => {
  const [status, setStatus] = useState<RelayStatus>({
    relay1: 'off',
    relay2: 'off',
  });

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/relay');
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const controlRelay = async (
    relay: keyof RelayStatus,
    action: 'on' | 'off'
  ) => {
    try {
      await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relay, action }),
      });
      fetchStatus(); // Update status
    } catch (error) {
      console.error('Error controlling relay:', error);
    }
  };

  useEffect(() => {
    fetchStatus(); // Fetch initial status
  }, []);

  return (
    <div>
      <h1>IoT Relay Control</h1>
      <div>
        <h2>Relay 1: {status.relay1}</h2>
        <button onClick={() => controlRelay('relay1', 'on')}>Turn ON</button>
        <button onClick={() => controlRelay('relay1', 'off')}>Turn OFF</button>
      </div>
      <div>
        <h2>Relay 2: {status.relay2}</h2>
        <button onClick={() => controlRelay('relay2', 'on')}>Turn ON</button>
        <button onClick={() => controlRelay('relay2', 'off')}>Turn OFF</button>
      </div>
    </div>
  );
};

export default Home;
