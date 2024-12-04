'use client';

import { useState } from 'react';

export default function ControlPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const sendCommand = async (command: 'power_on' | 'restart') => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`Command "${command}" sent successfully!`);
      } else {
        setMessage(`Failed to send command: ${data.error}`);
      }
    } catch (error) {
      setMessage('Error sending command');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Control Relay</h1>
      <button onClick={() => sendCommand('power_on')} disabled={loading}>
        Power On
      </button>
      <button onClick={() => sendCommand('restart')} disabled={loading}>
        Restart
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
