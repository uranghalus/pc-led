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
        { message: 'IP controller not configured' },
        { status: 404 }
      );
    }

    const ipController = setting.ip_controller;
    const url = `http://${ipController}/trigger/${action}`;

    console.log('Requesting URL:', url);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Failed response from Arduino:', response.statusText);
        return NextResponse.json(
          {
            message: 'Failed to communicate with Arduino',
            status: response.status,
            statusText: response.statusText,
          },
          { status: 500 }
        );
      }

      // Attempt to parse as JSON, fallback to text
      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json')
        ? await response.json()
        : await response.text();

      console.log('Response from Arduino:', data);

      return NextResponse.json({
        message: data,
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('Request to Arduino timed out');
        return NextResponse.json(
          { message: 'Request to Arduino timed out' },
          { status: 504 }
        );
      }

      if (error instanceof TypeError) {
        console.error('Network error:', error.message);
        return NextResponse.json(
          {
            message: 'Network error occurred',
            details: error.message,
          },
          { status: 503 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('Unexpected error in /api/trigger:', error);

    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
