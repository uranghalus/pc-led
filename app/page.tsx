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
      const response = await fetch(`http://192.168.15.5/trigger/${action}`);
      const data = await response.text();
      setStatus(data);
    } catch (error) {
      console.error('Error:', error);
      setStatus('Failed to connect to Arduino');
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
          <Badge>{status}</Badge>
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
  );
};

export default Page;
