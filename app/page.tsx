'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Computer, Power, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Page = () => {
  const [status, setStatus] = useState<string>('Idle');
  const [loading, setLoading] = useState<boolean>(false);

  // Unified function to handle actions
  const triggerAction = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trigger/${action}`);
      const data = await response.json();
      setStatus(data.message);
    } catch (error) {
      console.error('Error:', error);
      setStatus('Failed to connect to Arduino');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-3 pb-2">
            <CardTitle className="text-sm font-medium">Status PC</CardTitle>
            <div className="text-2xl font-bold">
              {/* {ipController
                ? `Controller IP: ${ipController}`
                : 'Loading IP...'} */}
              Test
            </div>
            <Badge variant={status === 'Idle' ? 'default' : 'destructive'}>
              {status}
            </Badge>
          </div>
          <div className="rounded-lg bg-blue-500 p-5">
            <Computer className="w-8 h-8 text-white" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Button Hidupkan PC */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Hidupkan PC
              </div>
              <Button
                className="h-12 w-full bg-green-500 text-white hover:bg-green-700"
                size="lg"
                onClick={() => triggerAction('power_on')}
                disabled={loading}
              >
                <Power className="mr-2 w-6 h-6" />
                Hidupkan
              </Button>
            </div>

            {/* Button Matikan PC */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Matikan PC
              </div>
              <Button
                className="h-12 w-full bg-red-500 text-white hover:bg-red-700"
                size="lg"
                onClick={() => triggerAction('power_off')}
                disabled={loading}
              >
                <Power className="mr-2 w-6 h-6" />
                Matikan
              </Button>
            </div>
          </div>

          {/* Button Restart PC */}
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">
              Restart PC
            </div>
            <Button
              className="h-12 w-full bg-amber-500 text-white hover:bg-amber-700"
              size="lg"
              onClick={() => triggerAction('restart')}
              disabled={loading}
            >
              <RotateCcw className="mr-2 w-6 h-6" />
              Restart
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
