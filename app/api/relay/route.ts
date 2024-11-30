import { NextRequest, NextResponse } from 'next/server';

let relay1Status = 'off';
let relay2Status = 'idle';

// Function to enable CORS for all requests
function setCorsHeaders() {
  return new Headers({
    'Access-Control-Allow-Origin': '*', // Ganti '*' dengan domain tertentu jika diperlukan
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

  // Kirim status relay setelah update dengan header CORS
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
