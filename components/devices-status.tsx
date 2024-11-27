'use client';

import React, { useEffect, useState } from 'react';
type DeviceStatus = {
  ip: string;
  isConnected: boolean;
};
const DevicesStatus = () => {
  const [status, setStatus] = useState<DeviceStatus | null>(null);

  const fetchDeviceStatus = async () => {
    try {
      const response = await fetch('/api/device-status');
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Error fetching device status:', error);
    }
  };

  useEffect(() => {
    // Fetch device status setiap 5 detik
    fetchDeviceStatus();
    const interval = setInterval(fetchDeviceStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="card w-full max-w-md bg-white shadow-xl p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Device Status
        </h2>
        {status ? (
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">IP Address:</span> {status.ip}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Status:</span>{' '}
              <span
                className={`badge ${
                  status.isConnected ? 'badge-success' : 'badge-error'
                }`}
              >
                {status.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </p>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="ml-2 text-gray-600">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicesStatus;
