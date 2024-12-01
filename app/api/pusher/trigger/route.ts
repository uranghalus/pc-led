import { pusher } from '@/lib/pusher';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Parse data yang diterima dari frontend
    const { channel, event, data } = await req.json();

    // Validasi input
    if (!channel || !event || !data) {
      console.error('Missing required fields:', { channel, event, data });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log data yang diterima untuk debugging
    console.log('Triggering Pusher event:', { channel, event, data });

    // Pastikan data memiliki struktur yang benar
    if (
      typeof data !== 'object' ||
      !data.ip ||
      typeof data.isConnected !== 'boolean'
    ) {
      console.error('Invalid data format:', data);
      return NextResponse.json(
        { success: false, message: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Trigger event ke Pusher
    await pusher.trigger(channel, event, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error triggering Pusher event:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to trigger event' },
      { status: 500 }
    );
  }
}
