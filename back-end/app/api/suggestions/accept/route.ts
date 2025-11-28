import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/suggestions/accept
 *
 * Accept a suggestion and create a session from it.
 * This is a convenience endpoint that creates a session with conflict checking disabled
 * (since suggestions already avoid conflicts).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionTypeId, scheduledAt, duration } = body;

    // Validation
    if (!sessionTypeId || typeof sessionTypeId !== 'string') {
      return NextResponse.json(
        { error: 'sessionTypeId is required and must be a string' },
        { status: 400 }
      );
    }

    // Verify session type exists
    const sessionType = await prisma.sessionType.findUnique({
      where: { id: sessionTypeId },
    });

    if (!sessionType) {
      return NextResponse.json(
        { error: 'Session type not found' },
        { status: 404 }
      );
    }

    if (!scheduledAt) {
      return NextResponse.json(
        { error: 'scheduledAt is required (ISO 8601 date string)' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: 'scheduledAt must be a valid ISO 8601 date string' },
        { status: 400 }
      );
    }

    if (typeof duration !== 'number' || duration <= 0) {
      return NextResponse.json(
        { error: 'duration must be a positive number (in minutes)' },
        { status: 400 }
      );
    }

    // Create the session
    // Note: We skip conflict checking since suggestions already avoid conflicts
    const session = await prisma.session.create({
      data: {
        sessionTypeId,
        scheduledAt: scheduledDate,
        duration,
      },
      include: {
        sessionType: true,
      },
    });

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error accepting suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to accept suggestion' },
      { status: 500 }
    );
  }
}
