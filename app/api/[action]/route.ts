import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { action: string } }
) {
  const { action } = params;
  const arduinoUrl = `http://192.168.15.5/${action}`; // Ganti dengan IP Arduino Anda

  try {
    const response = await fetch(arduinoUrl, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Arduino returned status ${response.status}`);
    }
    const data = await response.text();
    return NextResponse.json({ message: data });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
