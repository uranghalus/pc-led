import { NextResponse } from 'next/server';

// Simpan status kontrol di memori sementara
let controlCommand: 'power_on' | 'restart' | null = null;

export async function GET() {
  return NextResponse.json({ command: controlCommand });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    controlCommand = body.command; // Simpan perintah
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting control command:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set control command' },
      { status: 500 }
    );
  }
}
