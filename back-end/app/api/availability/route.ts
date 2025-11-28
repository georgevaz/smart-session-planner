import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/availability - List all availability windows
export async function GET() {
  try {
    const availabilityWindows = await prisma.availabilityWindow.findMany({
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(availabilityWindows);
  } catch (error) {
    console.error('Error fetching availability windows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability windows' },
      { status: 500 }
    );
  }
}

// POST /api/availability - Create a new availability window
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dayOfWeek, startTime, endTime } = body;

    // Validation
    if (typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: 'dayOfWeek must be a number between 0 (Sunday) and 6 (Saturday)' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!startTime || !timeRegex.test(startTime)) {
      return NextResponse.json(
        { error: 'startTime must be in HH:MM format (e.g., 09:00)' },
        { status: 400 }
      );
    }

    if (!endTime || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: 'endTime must be in HH:MM format (e.g., 17:00)' },
        { status: 400 }
      );
    }

    // Validate that startTime is before endTime
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return NextResponse.json(
        { error: 'startTime must be before endTime' },
        { status: 400 }
      );
    }

    const availabilityWindow = await prisma.availabilityWindow.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    return NextResponse.json(availabilityWindow, { status: 201 });
  } catch (error) {
    console.error('Error creating availability window:', error);
    return NextResponse.json(
      { error: 'Failed to create availability window' },
      { status: 500 }
    );
  }
}
