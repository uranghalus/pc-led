'use client';

import DevicesStatus from '@/components/devices-status';
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
      console.log(data.status);

      setStatus(data.status);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const controlRelay = async (
    relay: keyof RelayStatus,
    action: 'on' | 'off' | 'restart'
  ) => {
    try {
      await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relay, action }),
      });
      fetchStatus();
      // Update status
    } catch (error) {
      console.error('Error controlling relay:', error);
    }
  };

  useEffect(() => {
    fetchStatus(); // Fetch initial status
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-5 bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800">Controller Led Giant</h1>
      <DevicesStatus />
      <div className="space-y-8 w-full max-w-md">
        {/* Relay 1 - Power Control */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            Power:{' '}
            <span
              className={`font-normal ${
                status.relay1 === 'on' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {status.relay1.toUpperCase()}
            </span>
          </h2>
          <div className="flex items-center justify-center">
            <label className="flex items-center space-x-3">
              <span className="text-gray-700">Power Toggle</span>
              <input
                type="checkbox"
                className="toggle toggle-success toggle-lg"
                defaultChecked={status.relay1 === 'on'}
                onChange={(e) =>
                  controlRelay('relay1', e.target.checked ? 'on' : 'off')
                }
              />
            </label>
          </div>
        </div>

        {/* Relay 2 - Restart Control */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-700">
            Restart Device
          </h2>
          <div className="flex items-center justify-center">
            <button
              className="btn btn-error btn-block"
              onClick={() => controlRelay('relay2', 'restart')}
            >
              Restart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
