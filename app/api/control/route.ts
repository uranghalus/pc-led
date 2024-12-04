import { NextResponse } from 'next/server';
import { pusher } from '@/lib/pusher';

export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  if (action === 'power_on' || action === 'restart') {
    await pusher.trigger('device-channel', 'control-command', {
      command: action,
    });
    return NextResponse.json({
      success: true,
      message: `Command ${action} sent.`,
    });
  }

  return NextResponse.json(
    { success: false, message: 'Invalid action.' },
    { status: 400 }
  );
}
