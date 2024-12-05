import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  console.log('Heartbeat received:', data);

  return NextResponse.json({ message: 'Heartbeat received' }, { status: 200 });
}
