'use client';

import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

export default function Dashboard() {
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [commandResponse, setCommandResponse] = useState<string | null>(null);

  // Fungsi untuk mengirim perintah kontrol ke NodeMCU
  const sendCommand = async (command: 'power_on' | 'restart') => {
    try {
      const response = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      if (response.ok) {
        setCommandResponse(`Command "${command}" sent successfully`);
      } else {
        setCommandResponse('Failed to send command');
      }
    } catch (error) {
      console.error('Error sending command:', error);
      setCommandResponse('Error sending command');
    }
  };

  useEffect(() => {
    // Inisialisasi Pusher untuk mendengarkan event status-update
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe('iot-status');
    channel.bind(
      'status-update',
      (data: { ip: string; isConnected: boolean }) => {
        setIpAddress(data.ip);
        setIsConnected(data.isConnected);
      }
    );

    return () => {
      pusher.unsubscribe('iot-status');
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>IoT Device Dashboard</h1>

      {/* Status Device */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Status</h2>
        <p>
          <strong>IP Address:</strong> {ipAddress || 'Loading...'}
        </p>
        <p>
          <strong>Connection:</strong>{' '}
          {isConnected ? (
            <span style={{ color: 'green' }}>Connected</span>
          ) : (
            <span style={{ color: 'red' }}>Disconnected</span>
          )}
        </p>
      </div>

      {/* Kontrol Relay */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Control Panel</h2>
        <button
          onClick={() => sendCommand('power_on')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Turn On PC
        </button>
        <button
          onClick={() => sendCommand('restart')}
          style={{
            padding: '10px 20px',
            backgroundColor: 'orange',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Restart PC
        </button>
      </div>

      {/* Respon Command */}
      {commandResponse && (
        <div style={{ color: 'gray', marginTop: '10px' }}>
          <strong>{commandResponse}</strong>
        </div>
      )}
    </div>
  );
}
