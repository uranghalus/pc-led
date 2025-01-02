'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Page: React.FC = () => {
  const [status, setStatus] = useState<string>('Idle');
  const [loading, setLoading] = useState<boolean>(false);

  const triggerAction = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: action }),
      });

      if (!response.ok) {
        throw new Error('Failed to send command');
      }

      const data = await response.json();
      setStatus(`Command sent: ${data.command}`);
    } catch (error) {
      console.error('Error:', error);
      setStatus('Failed to send command');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-3 pb-2">
          <CardTitle className="text-sm font-medium">Status PC</CardTitle>
          <div className="text-2xl font-bold">Arduino Controller</div>
          <Badge variant={status === 'Idle' ? 'default' : 'destructive'}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Button
            onClick={() => triggerAction('power_on')}
            disabled={loading}
            className="h-12 w-full bg-green-500 text-white hover:bg-green-700"
          >
            <Power className="mr-2 w-6 h-6" />
            Hidupkan
          </Button>
          <Button
            onClick={() => triggerAction('power_off')}
            disabled={loading}
            className="h-12 w-full bg-red-500 text-white hover:bg-red-700"
          >
            <Power className="mr-2 w-6 h-6" />
            Matikan
          </Button>
        </div>
        <Button
          onClick={() => triggerAction('restart')}
          disabled={loading}
          className="h-12 w-full bg-amber-500 text-white hover:bg-amber-700"
        >
          <RotateCcw className="mr-2 w-6 h-6" />
          Restart
        </Button>
      </CardContent>
    </Card>
  );
};

export default Page;
