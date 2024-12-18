import { pusher } from '@/lib/pusher';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ip, isConnected } = body.data;

    // Kirim event ke Pusher
    await pusher.trigger('iot-status', 'status-update', { ip, isConnected });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}
