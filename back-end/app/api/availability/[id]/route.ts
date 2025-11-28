import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/availability/[id] - Update an availability window
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { dayOfWeek, startTime, endTime } = body;

    // Check if the availability window exists
    const existing = await prisma.availabilityWindow.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Availability window not found' },
        { status: 404 }
      );
    }

    // Validation (only validate fields that are being updated)
    const updateData: any = {};

    if (dayOfWeek !== undefined) {
      if (typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6) {
        return NextResponse.json(
          { error: 'dayOfWeek must be a number between 0 (Sunday) and 6 (Saturday)' },
          { status: 400 }
        );
      }
      updateData.dayOfWeek = dayOfWeek;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (startTime !== undefined) {
      if (!timeRegex.test(startTime)) {
        return NextResponse.json(
          { error: 'startTime must be in HH:MM format (e.g., 09:00)' },
          { status: 400 }
        );
      }
      updateData.startTime = startTime;
    }

    if (endTime !== undefined) {
      if (!timeRegex.test(endTime)) {
        return NextResponse.json(
          { error: 'endTime must be in HH:MM format (e.g., 17:00)' },
          { status: 400 }
        );
      }
      updateData.endTime = endTime;
    }

    // Validate that startTime is before endTime (use updated values or existing)
    const finalStartTime = updateData.startTime || existing.startTime;
    const finalEndTime = updateData.endTime || existing.endTime;

    const [startHour, startMin] = finalStartTime.split(':').map(Number);
    const [endHour, endMin] = finalEndTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return NextResponse.json(
        { error: 'startTime must be before endTime' },
        { status: 400 }
      );
    }

    const updated = await prisma.availabilityWindow.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating availability window:', error);
    return NextResponse.json(
      { error: 'Failed to update availability window' },
      { status: 500 }
    );
  }
}

// DELETE /api/availability/[id] - Delete an availability window
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if the availability window exists
    const existing = await prisma.availabilityWindow.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Availability window not found' },
        { status: 404 }
      );
    }

    await prisma.availabilityWindow.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Availability window deleted successfully' });
  } catch (error) {
    console.error('Error deleting availability window:', error);
    return NextResponse.json(
      { error: 'Failed to delete availability window' },
      { status: 500 }
    );
  }
}
