import { NextResponse } from 'next/server';

type RelayStatus = {
  relay1: 'on' | 'off';
  relay2: 'on' | 'off';
};

let relayStatus: RelayStatus = { relay1: 'off', relay2: 'off' };

// Handle POST dan GET request
export async function GET() {
  return NextResponse.json({ status: relayStatus });
}

export async function POST(req: Request) {
  const { relay, action }: { relay: keyof RelayStatus; action: 'on' | 'off' } =
    await req.json();

  if (relay in relayStatus && (action === 'on' || action === 'off')) {
    relayStatus = { ...relayStatus, [relay]: action };
    return NextResponse.json({ success: true, status: relayStatus });
  } else {
    return NextResponse.json(
      { success: false, message: 'Invalid input' },
      { status: 400 }
    );
  }
}
