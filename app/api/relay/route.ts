import { NextResponse } from 'next/server';

let relay1Status = 'off';
let relay2Status = 'idle';

export async function GET() {
  // Kirim status relay
  return NextResponse.json({
    relay1: relay1Status,
    relay2: relay2Status,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Update status relay berdasarkan permintaan
  if (body.relay1) {
    relay1Status = body.relay1; // "on" atau "off"
  }

  if (body.relay2 === 'restart') {
    relay2Status = 'restarting';
    // Simulasikan proses restart
    setTimeout(() => {
      relay2Status = 'idle';
    }, 2000);
  }

  return NextResponse.json({
    relay1: relay1Status,
    relay2: relay2Status,
  });
}
