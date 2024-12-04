import { NextResponse } from 'next/server';

// Simpan status kontrol di memori sementara
let controlCommand: 'power_on' | 'restart' | null = null;

export async function GET() {
  try {
    // Kirim perintah kontrol ke NodeMCU
    if (controlCommand) {
      const command = controlCommand;
      controlCommand = null; // Reset setelah dikirim
      return NextResponse.json({ command });
    }
    return NextResponse.json({ command: null });
  } catch (error) {
    console.error('Error fetching control command:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch control command' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { command } = body;

    if (!['power_on', 'restart'].includes(command)) {
      return NextResponse.json(
        { success: false, error: 'Invalid command' },
        { status: 400 }
      );
    }

    // Simpan perintah kontrol
    controlCommand = command;
    console.log(`Received control command: ${command}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting control command:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set control command' },
      { status: 500 }
    );
  }
}
