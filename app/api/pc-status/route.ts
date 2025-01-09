import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { message: "Invalid request: 'status' is required." },
        { status: 400 }
      );
    }

    console.log(`PC Status: ${status}`);
    return NextResponse.json({ message: 'Status received' });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
