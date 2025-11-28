import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/sessions/[id] - Get a single session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        sessionType: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: session.id,
      sessionTypeId: session.sessionTypeId,
      sessionType: {
        id: session.sessionType.id,
        name: session.sessionType.name,
        category: session.sessionType.category,
        priority: session.sessionType.priority,
      },
      scheduledAt: session.scheduledAt,
      duration: session.duration,
      completed: session.completed,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/[id] - Update a session (e.g., mark as completed)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { completed, scheduledAt, duration } = body;

    // Check if session exists
    const existing = await prisma.session.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Update completed status
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return NextResponse.json(
          { error: 'completed must be a boolean' },
          { status: 400 }
        );
      }
      updateData.completed = completed;
    }

    // Update scheduled time
    if (scheduledAt !== undefined) {
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return NextResponse.json(
          { error: 'scheduledAt must be a valid ISO 8601 date string' },
          { status: 400 }
        );
      }
      updateData.scheduledAt = scheduledDate;
    }

    // Update duration
    if (duration !== undefined) {
      if (typeof duration !== 'number' || duration <= 0) {
        return NextResponse.json(
          { error: 'duration must be a positive number (in minutes)' },
          { status: 400 }
        );
      }
      updateData.duration = duration;
    }

    const updated = await prisma.session.update({
      where: { id },
      data: updateData,
      include: {
        sessionType: true,
      },
    });

    return NextResponse.json({
      id: updated.id,
      sessionTypeId: updated.sessionTypeId,
      sessionType: {
        id: updated.sessionType.id,
        name: updated.sessionType.name,
        category: updated.sessionType.category,
        priority: updated.sessionType.priority,
      },
      scheduledAt: updated.scheduledAt,
      duration: updated.duration,
      completed: updated.completed,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - Delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if session exists
    const existing = await prisma.session.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    await prisma.session.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
