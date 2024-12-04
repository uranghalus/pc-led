'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

const Home = () => {
  const [deviceActive, setDeviceActive] = useState(false);
  const [lastCommand, setLastCommand] = useState('');

  useEffect(() => {
    const pusher = new Pusher(process.env.PUSHER_APP_KEY || '', {
      cluster: process.env.PUSHER_CLUSTER || '',
    });

    const channel = pusher.subscribe('device-channel');

    channel.bind('heartbeat', (data: { active: boolean }) => {
      setDeviceActive(data.active);
    });

    channel.bind('control-command', (data: { command: string }) => {
      setLastCommand(data.command);
    });

    return () => {
      pusher.unsubscribe('device-channel');
    };
  }, []);

  const sendCommand = async (action: 'power_on' | 'restart') => {
    const response = await fetch('/api/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await response.json();
    if (!data.success) {
      alert('Failed to send command.');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>IoT Control Panel</h1>
      <p>
        Device Status:{' '}
        <span style={{ color: deviceActive ? 'green' : 'red' }}>
          {deviceActive ? 'Active' : 'Inactive'}
        </span>
      </p>
      <p>Last Command: {lastCommand || 'None'}</p>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => sendCommand('power_on')} style={buttonStyle}>
          Power On
        </button>
        <button onClick={() => sendCommand('restart')} style={buttonStyle}>
          Restart
        </button>
      </div>
    </div>
  );
};

const buttonStyle = {
  margin: '0.5rem',
  padding: '1rem',
  fontSize: '1rem',
  cursor: 'pointer',
};

export default Home;
