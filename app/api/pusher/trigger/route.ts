import { pusher } from '@/lib/pusher';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { channel, event, data } = await req.json();
    console.log('Received data:', { channel, event, data });
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
