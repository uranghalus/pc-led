import { NextResponse } from 'next/server';
import { pusher } from '@/lib/pusher';

let lastHeartbeat = Date.now();

export async function POST() {
  lastHeartbeat = Date.now();
  await pusher.trigger('device-channel', 'heartbeat', { active: true });
  return NextResponse.json({ success: true, message: 'Heartbeat received.' });
}

export async function GET() {
  const isActive = Date.now() - lastHeartbeat <= 15000; // Cek heartbeat dalam 15 detik terakhir
  return NextResponse.json({ deviceActive: isActive });
}
