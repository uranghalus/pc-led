'use client';

import DevicesStatus from '@/components/devices-status';
import { RiRestartLine, RiShutDownLine } from '@remixicon/react';
import { useState, useEffect } from 'react';

const Home = () => {
  const [relay1Status, setRelay1Status] = useState('off');
  const [relay2Status, setRelay2Status] = useState('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchRelayStatus = async () => {
    try {
      const res = await fetch('/api/relay');
      if (!res.ok) throw new Error('Failed to fetch relay status');
      const data = await res.json();
      setRelay1Status(data.relay1);
      setRelay2Status(data.relay2);
    } catch (error) {
      setErrorMessage('Error fetching relay status. Please try again.');
      console.error('Error fetching relay status:', error);
    }
  };

  const toggleRelay1 = async () => {
    const newStatus = relay1Status === 'on' ? 'off' : 'on';
    try {
      const res = await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relay1: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to toggle relay 1');
      setRelay1Status(newStatus);
    } catch (error) {
      setErrorMessage('Error toggling relay 1. Please try again.');
      console.error('Error toggling relay 1:', error);
    }
  };

  const restartRelay2 = async () => {
    try {
      const res = await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relay2: 'restart' }),
      });
      if (!res.ok) throw new Error('Failed to restart relay 2');
      setRelay2Status('restarting');

      // Tunggu hingga waktu restart selesai, lalu perbarui status
      setTimeout(fetchRelayStatus, 6000);
    } catch (error) {
      setErrorMessage('Error restarting relay 2. Please try again.');
      console.error('Error restarting relay 2:', error);
    }
  };

  useEffect(() => {
    fetchRelayStatus();
  }, []);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center bg-white p-8 min-h-screen min-w-[320px] max-w-lg w-full">
        <DevicesStatus />
        <div className="mt-5 w-full">
          <div className="text-2xl text-left">Control PC</div>
          {errorMessage && (
            <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
              {errorMessage}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 w-full">
            {/* Kolom 1 */}
            <div className="bg-white p-4 rounded-2xl shadow-lg space-y-2 w-full max-w-xs">
              <h2 className="text-sm font-bold text-left">Hidupkan PC</h2>
              <button
                onClick={toggleRelay1}
                className="flex flex-col items-center justify-center w-full bg-[#A62639] text-white rounded-[15px] p-[15px_14px] max-w-xs 
              transform transition-all duration-200 hover:bg-[#8f1f2b] active:scale-95"
              >
                <RiShutDownLine className="text-white text-4xl" />
                <span className="text-base font-medium text-white">
                  Turn On
                </span>
              </button>
            </div>
            {/* Kolom 2 */}
            <div className="bg-white p-4 rounded-2xl shadow-lg space-y-2 w-full max-w-xs">
              <h2 className="text-sm font-bold text-left">Restart PC</h2>
              <button
                onClick={restartRelay2}
                className={`flex flex-col items-center justify-center w-full bg-[#E5B769] text-white rounded-[15px] p-[15px_14px] max-w-xs 
              transform transition-all duration-200 hover:bg-[#d49a5b] active:scale-95`}
                disabled={relay2Status === 'restarting'}
              >
                <RiRestartLine className="text-white text-4xl" />
                <span className="text-base font-medium text-white">
                  {relay2Status === 'restarting'
                    ? 'Please wait...'
                    : 'Restart PC'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
