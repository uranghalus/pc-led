'use client';

import DevicesStatus from '@/components/devices-status';
import { useState, useEffect } from 'react';

const Home = () => {
  const [relay1Status, setRelay1Status] = useState('off');
  const [relay2Status, setRelay2Status] = useState('idle');

  const fetchRelayStatus = async () => {
    try {
      const res = await fetch('/api/relay');
      const data = await res.json();
      setRelay1Status(data.relay1);
      setRelay2Status(data.relay2);
    } catch (error) {
      console.error('Error fetching relay status:', error);
    }
  };

  const toggleRelay1 = async () => {
    const newStatus = relay1Status === 'on' ? 'off' : 'on';
    try {
      await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relay1: newStatus }),
      });
      setRelay1Status(newStatus);
    } catch (error) {
      console.error('Error toggling relay 1:', error);
    }
  };

  const restartRelay2 = async () => {
    try {
      await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relay2: 'restart' }),
      });
      setRelay2Status('restarting');
      setTimeout(() => fetchRelayStatus(), 2000); // Refresh status setelah restart selesai
    } catch (error) {
      console.error('Error restarting relay 2:', error);
    }
  };

  useEffect(() => {
    fetchRelayStatus();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Kontrol Relay</h1>
      <div className="flex flex-col gap-4">
        <DevicesStatus />
        <div className="bg-white p-4 rounded shadow w-64 text-center">
          <h2 className="text-lg font-semibold">Relay 1</h2>
          <p className="mb-2">Status: {relay1Status}</p>
          <button
            onClick={toggleRelay1}
            className={`py-2 px-4 rounded ${
              relay1Status === 'on' ? 'bg-red-500' : 'bg-green-500'
            } text-white`}
          >
            {relay1Status === 'on' ? 'Matikan' : 'Hidupkan'}
          </button>
        </div>
        <div className="bg-white p-4 rounded shadow w-64 text-center">
          <h2 className="text-lg font-semibold">Relay 2 (Restart)</h2>
          <p className="mb-2">Status: {relay2Status}</p>
          <button
            onClick={restartRelay2}
            className="py-2 px-4 bg-blue-500 text-white rounded"
            disabled={relay2Status === 'restarting'}
          >
            Restart
          </button>
        </div>
      </div>
    </main>
  );
};

export default Home;
