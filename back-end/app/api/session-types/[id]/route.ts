import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/session-types/[id] - Get a single session type
export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    const sessionType = await prisma.sessionType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sessions: {
              where: {
                completed: true,
              },
            },
          },
        },
      },
    });

    if (!sessionType) {
      return NextResponse.json(
        { error: 'Session type not found' },
        { status: 404 }
      );
    }

    const response = {
      id: sessionType.id,
      name: sessionType.name,
      category: sessionType.category,
      priority: sessionType.priority,
      createdAt: sessionType.createdAt,
      updatedAt: sessionType.updatedAt,
      completedCount: sessionType._count.sessions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching session type:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session type' },
      { status: 500 }
    );
  }
}

// PUT /api/session-types/[id] - Update a session type
export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, priority } = body;

    // Check if session type exists
    const existing = await prisma.sessionType.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Session type not found' },
        { status: 404 }
      );
    }

    // Validation
    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name must be a string' },
        { status: 400 }
      );
    }

    if (category !== undefined && typeof category !== 'string') {
      return NextResponse.json(
        { error: 'Category must be a string' },
        { status: 400 }
      );
    }

    if (
      priority !== undefined &&
      (typeof priority !== 'number' || priority < 1 || priority > 5)
    ) {
      return NextResponse.json(
        { error: 'Priority must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    const sessionType = await prisma.sessionType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(priority !== undefined && { priority }),
      },
    });

    return NextResponse.json(sessionType);
  } catch (error) {
    console.error('Error updating session type:', error);
    return NextResponse.json(
      { error: 'Failed to update session type' },
      { status: 500 }
    );
  }
}

// DELETE /api/session-types/[id] - Delete a session type
export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    // Check if session type exists
    const existing = await prisma.sessionType.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Session type not found' },
        { status: 404 }
      );
    }

    // Delete the session type (cascades to delete related sessions)
    await prisma.sessionType.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Session type deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting session type:', error);
    return NextResponse.json(
      { error: 'Failed to delete session type' },
      { status: 500 }
    );
  }
}
