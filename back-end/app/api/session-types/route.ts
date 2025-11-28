import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/session-types - List all session types with completed count
export async function GET() {
  try {
    const sessionTypes = await prisma.sessionType.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the response to include completedCount
    const response = sessionTypes.map((type) => ({
      id: type.id,
      name: type.name,
      category: type.category,
      priority: type.priority,
      createdAt: type.createdAt,
      updatedAt: type.updatedAt,
      completedCount: type._count.sessions,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching session types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session types' },
      { status: 500 }
    );
  }
}

// POST /api/session-types - Create a new session type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, priority } = body;

    // Validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        { error: 'Category is required and must be a string' },
        { status: 400 }
      );
    }

    if (
      typeof priority !== 'number' ||
      priority < 1 ||
      priority > 5
    ) {
      return NextResponse.json(
        { error: 'Priority must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    const sessionType = await prisma.sessionType.create({
      data: {
        name,
        category,
        priority,
      },
    });

    return NextResponse.json(sessionType, { status: 201 });
  } catch (error) {
    console.error('Error creating session type:', error);
    return NextResponse.json(
      { error: 'Failed to create session type' },
      { status: 500 }
    );
  }
}
