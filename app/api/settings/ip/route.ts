import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma client

// GET: Fetch the current IP controller settings
export async function GET() {
  try {
    const setting = await prisma.setting.findFirst();
    if (!setting) {
      return NextResponse.json(
        { message: 'No settings found.' },
        { status: 404 }
      );
    }
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch settings.' },
      { status: 500 }
    );
  }
}

// POST: Add or Update the IP controller settings
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ip_controller, name } = body;

    if (!ip_controller || !name) {
      return NextResponse.json(
        { message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Check if a setting already exists
    const existingSetting = await prisma.setting.findFirst();

    if (existingSetting) {
      // Update existing setting
      const updatedSetting = await prisma.setting.update({
        where: { id: existingSetting.id },
        data: { ip_controller, name },
      });
      return NextResponse.json({
        message: 'Settings updated successfully.',
        setting: updatedSetting,
      });
    } else {
      // Create new setting
      const newSetting = await prisma.setting.create({
        data: { ip_controller, name },
      });
      return NextResponse.json({
        message: 'Settings added successfully.',
        setting: newSetting,
      });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { message: 'Failed to save settings.' },
      { status: 500 }
    );
  }
}
