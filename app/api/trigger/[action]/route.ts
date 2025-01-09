import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { action: string } }
) {
  try {
    const { action } = params;

    // Fetch the IP controller from the database
    const setting = await prisma.setting.findFirst();
    if (!setting || !setting.ip_controller) {
      return NextResponse.json(
        { message: 'IP controller not found tidak ditemukan' },
        { status: 400 }
      );
    }

    const ipController = setting.ip_controller;
    const url = `http://${ipController}/trigger/${action}`;

    console.log('Requesting URL:', url);

    // Use AbortController to set a timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5 seconds

    try {
      // Perform the GET request to the Arduino
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Failed response from Arduino:', response.statusText);
        return NextResponse.json(
          { message: 'Failed to communicate with Arduino' },
          { status: 500 }
        );
      }

      // Parse response as text
      const data = await response.text();

      console.log('Response from Arduino:', data);
      return NextResponse.json({ message: data });
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('Request to Arduino timed out');
        return NextResponse.json(
          { message: 'Request to Arduino timed out' },
          { status: 504 }
        );
      }

      throw error; // Rethrow other errors
    }
  } catch (error: unknown) {
    console.error('Error in /api/trigger:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: 'Internal Server Error', error: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { message: 'Internal Server Error', error: 'Unknown error' },
        { status: 500 }
      );
    }
  }
}
