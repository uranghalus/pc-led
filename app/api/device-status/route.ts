import { NextResponse } from 'next/server';

type DeviceStatus = {
  ip: string;
  isConnected: boolean;
};

let deviceStatus: DeviceStatus = { ip: '', isConnected: false };

export async function GET() {
  return NextResponse.json({ status: deviceStatus });
}

export async function POST(req: Request) {
  try {
    const { ip, isConnected }: DeviceStatus = await req.json();

    deviceStatus = { ip, isConnected };
    console.log('Device Status Updated:', deviceStatus);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { success: false, message: 'Invalid data format' },
      { status: 400 }
    );
  }
}
