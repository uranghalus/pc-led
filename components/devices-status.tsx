'use client';

import { RiComputerLine, RiGlobalLine } from '@remixicon/react';
import Pusher from 'pusher-js';
import React, { useEffect, useState } from 'react';
type DeviceStatus = {
  ip: string;
  isConnected: boolean;
};
const DevicesStatus = () => {
  const [status, setStatus] = useState<DeviceStatus | null>(null);

  useEffect(() => {
    // Fetch device status setiap 5 detik
    // Setup koneksi Pusher
    const pusher = new Pusher('c09111d6e77b55cca39f', {
      cluster: 'ap1',
    });

    const channel = pusher.subscribe('iot-status');
    channel.bind('status-update', (data: DeviceStatus) => {
      setStatus(data);
    });

    return () => {
      pusher.unsubscribe('iot-status');
    };
  }, []);

  return (
    <div className="card w-full bg-[#55828B] shadow-xl p-6 rounded-lg">
      <div className="card-title text-white font-bold text-lg mb-3">
        Device Status
      </div>
      <div className="card-body p-0">
        {status ? (
          <div className="space-y-4 w-full">
            <div className="w-full flex items-center justify-between">
              <div className="p-3 bg-white rounded-xl ">
                <RiGlobalLine className="text-[#55828B] size-5" />
              </div>
              <p className="text-xl font-semibold text-white text-right">
                {status?.ip || 'Dummy IP'}
              </p>
            </div>
            <div className="w-full flex items-center justify-between">
              <div className="p-3 bg-white rounded-xl flex items-center justify-center">
                <RiComputerLine className="size-5 text-[#55828B]" />
              </div>
              <span
                className={`badge p-4 text-base font-medium text-white border-2 border-white ${
                  status?.isConnected ? 'badge-success' : 'badge-error'
                }`}
              >
                {status?.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
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
