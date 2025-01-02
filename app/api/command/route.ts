import { NextResponse } from 'next/server';

let currentCommand: string = 'idle'; // Default command

export async function GET() {
  // Arduino meminta perintah
  return NextResponse.json({ command: currentCommand });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { command } = body;

  if (['power_on', 'power_off', 'restart', 'idle'].includes(command)) {
    currentCommand = command;
    return NextResponse.json({ message: 'Command updated', command });
  } else {
    return NextResponse.json({ message: 'Invalid command' }, { status: 400 });
  }
}
