'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

export default function StatusPage() {
  const [status, setStatus] = useState<{
    ip: string;
    isConnected: boolean;
  } | null>(null);

  useEffect(() => {
    const pusher = new Pusher('c09111d6e77b55cca39f', {
      cluster: 'ap1',
    });
    const channel = pusher.subscribe('iot-status');

    channel.bind(
      'status-update',
      (data: { ip: string; isConnected: boolean }) => {
        setStatus(data);
      }
    );

    return () => {
      pusher.unsubscribe('iot-status');
    };
  }, []);

  return (
    <div>
      <h1>Device Status</h1>
      {status ? (
        <div>
          <p>IP: {status.ip}</p>
          <p>Connection: {status.isConnected ? 'Connected' : 'Disconnected'}</p>
        </div>
      ) : (
        <p>Waiting for status updates...</p>
      )}
    </div>
  );
}
