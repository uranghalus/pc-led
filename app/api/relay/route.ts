import { NextRequest, NextResponse } from 'next/server';

let relay1Status: string = 'off';
let relay2Status: string = 'idle';
let restartId: symbol | null = null; // Tipe eksplisit untuk restartId

// Function to enable CORS for all requests
function setCorsHeaders() {
  return new Headers({
    'Access-Control-Allow-Origin': 'http://example.com', // Ganti dengan domain yang diizinkan
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
}

export async function GET() {
  // Kirim status relay dengan header CORS
  const headers = setCorsHeaders();
  return NextResponse.json(
    {
      relay1: relay1Status,
      relay2: relay2Status,
    },
    { headers }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validasi input
  if (body.relay1 && !['on', 'off'].includes(body.relay1)) {
    return NextResponse.json(
      { success: false, message: 'Invalid relay1 status' },
      { status: 400 }
    );
  }
  if (body.relay2 && body.relay2 !== 'restart') {
    return NextResponse.json(
      { success: false, message: 'Invalid relay2 status' },
      { status: 400 }
    );
  }

  // Update status relay
  if (body.relay1) {
    relay1Status = body.relay1;
  }

  if (body.relay2 === 'restart') {
    if (relay2Status !== 'restarting') {
      relay2Status = 'restarting';
      const currentRestartId: symbol = Symbol('restartId'); // Identifier unik dengan tipe eksplisit
      restartId = currentRestartId;

      setTimeout(() => {
        // Hanya ubah status jika identifier masih cocok
        if (restartId === currentRestartId) {
          relay2Status = 'idle';
        }
      }, 6000);
    }
  }

  // Kirim status relay setelah update
  const headers = setCorsHeaders();
  return NextResponse.json(
    {
      relay1: relay1Status,
      relay2: relay2Status,
    },
    { headers }
  );
}

export async function OPTIONS() {
  // Pre-flight CORS request
  const headers = setCorsHeaders();
  return new Response(null, {
    headers,
    status: 204, // Status code for successful preflight
  });
}
