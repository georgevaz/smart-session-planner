import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to check for session conflicts
async function checkConflicts(
  scheduledAt: Date,
  duration: number,
  excludeSessionId?: string
): Promise<{ hasConflict: boolean; conflictingSessions: any[] }> {
  const sessionEnd = new Date(scheduledAt.getTime() + duration * 60000);

  // Find all sessions that overlap with this time range
  // A session conflicts if:
  // 1. It starts before this session ends AND
  // 2. It ends after this session starts
  const allSessions = await prisma.session.findMany({
    where: excludeSessionId
      ? {
          id: { not: excludeSessionId },
        }
      : undefined,
    include: {
      sessionType: true,
    },
  });

  const conflictingSessions = allSessions.filter((session) => {
    const existingStart = new Date(session.scheduledAt);
    const existingEnd = new Date(existingStart.getTime() + session.duration * 60000);

    // Check for overlap
    return existingStart < sessionEnd && existingEnd > scheduledAt;
  });

  return {
    hasConflict: conflictingSessions.length > 0,
    conflictingSessions: conflictingSessions.map((s) => ({
      id: s.id,
      sessionType: s.sessionType.name,
      scheduledAt: s.scheduledAt,
      duration: s.duration,
    })),
  };
}

// GET /api/sessions - List all sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    // Filter for upcoming sessions (not completed, scheduled in the future)
    if (upcoming) {
      where.scheduledAt = { gte: new Date() };
      where.completed = false;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) {
        where.scheduledAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.scheduledAt.lte = new Date(endDate);
      }
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        sessionType: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    // Transform response to include session type details
    const response = sessions.map((session) => ({
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
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionTypeId, scheduledAt, duration, checkConflict = true } = body;

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

    // Check for conflicts if requested
    if (checkConflict) {
      const { hasConflict, conflictingSessions } = await checkConflicts(
        scheduledDate,
        duration
      );

      if (hasConflict) {
        return NextResponse.json(
          {
            error: 'Session conflicts with existing sessions',
            conflicts: conflictingSessions,
          },
          { status: 409 } // 409 Conflict
        );
      }
    }

    // Create the session
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
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
