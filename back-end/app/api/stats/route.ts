import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Get the current date/time for the application
 * Using a static date (Monday, November 17, 2025) for demo purposes
 */
function getCurrentDate(): Date {
  return new Date('2025-11-17T12:00:00');
}

/**
 * GET /api/stats
 *
 * Returns overall progress and statistics for the user's sessions.
 * Includes:
 * - Total and completed session counts
 * - Breakdown by session type
 * - Derived metrics (average spacing, streaks)
 */
export async function GET() {
  try {
    // Fetch all sessions with their session types
    const allSessions = await prisma.session.findMany({
      include: {
        sessionType: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    const now = getCurrentDate();
    const completedSessions = allSessions.filter((s) => s.completed);
    const upcomingSessions = allSessions.filter(
      (s) => new Date(s.scheduledAt) >= now && !s.completed
    );

    // ========== BREAKDOWN BY SESSION TYPE ==========
    const sessionTypes = await prisma.sessionType.findMany({
      include: {
        sessions: true,
      },
    });

    const byType = sessionTypes.map((type) => {
      const typeSessions = type.sessions;
      const completedCount = typeSessions.filter((s) => s.completed).length;
      const totalCount = typeSessions.length;

      return {
        id: type.id,
        name: type.name,
        category: type.category,
        priority: type.priority,
        totalSessions: totalCount,
        completedSessions: completedCount,
        upcomingSessions: typeSessions.filter(
          (s) => new Date(s.scheduledAt) >= now && !s.completed
        ).length,
        completionRate: totalCount > 0 ? completedCount / totalCount : 0,
      };
    });

    // ========== DERIVED METRICS ==========

    // 1. AVERAGE SPACING (days between completed sessions)
    let averageSpacing: number | null = null;
    if (completedSessions.length >= 2) {
      const sortedCompleted = completedSessions
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

      let totalSpacing = 0;
      for (let i = 1; i < sortedCompleted.length; i++) {
        const diff =
          new Date(sortedCompleted[i].scheduledAt).getTime() -
          new Date(sortedCompleted[i - 1].scheduledAt).getTime();
        totalSpacing += diff / (1000 * 60 * 60 * 24); // Convert to days
      }
      averageSpacing = Math.round((totalSpacing / (sortedCompleted.length - 1)) * 10) / 10;
    }

    // 2. CURRENT STREAK (consecutive days with completed sessions)
    let currentStreak = 0;
    if (completedSessions.length > 0) {
      const sortedCompleted = completedSessions
        .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

      const today = getCurrentDate();
      today.setHours(0, 0, 0, 0);

      let checkDate = new Date(today);
      let sessionIndex = 0;

      // Go backwards day by day from today
      while (sessionIndex < sortedCompleted.length) {
        const sessionDate = new Date(sortedCompleted[sessionIndex].scheduledAt);
        sessionDate.setHours(0, 0, 0, 0);

        // If there's a session on checkDate, increment streak
        if (sessionDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          sessionIndex++;
          // Move to previous day
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (sessionDate.getTime() < checkDate.getTime()) {
          // Session is older than checkDate, move checkDate back
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Session is newer than checkDate, move to next session
          sessionIndex++;
        }

        // Break if we've gone too far back (more than 1 day gap)
        const daysSinceSession =
          (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24);
        if (currentStreak === 0 && daysSinceSession > 1) {
          break;
        }
      }
    }

    // 3. LONGEST STREAK
    let longestStreak = 0;
    if (completedSessions.length > 0) {
      const sortedCompleted = completedSessions
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

      let tempStreak = 1;
      let maxStreak = 1;

      for (let i = 1; i < sortedCompleted.length; i++) {
        const prevDate = new Date(sortedCompleted[i - 1].scheduledAt);
        prevDate.setHours(0, 0, 0, 0);

        const currDate = new Date(sortedCompleted[i].scheduledAt);
        currDate.setHours(0, 0, 0, 0);

        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
          // Consecutive day
          tempStreak++;
          maxStreak = Math.max(maxStreak, tempStreak);
        } else if (dayDiff === 0) {
          // Same day, don't break streak but don't increment
          continue;
        } else {
          // Streak broken
          tempStreak = 1;
        }
      }

      longestStreak = maxStreak;
    }

    // 4. MOST PRODUCTIVE DAY OF WEEK
    const dayOfWeekCounts = new Array(7).fill(0);
    completedSessions.forEach((session) => {
      const day = new Date(session.scheduledAt).getDay();
      dayOfWeekCounts[day]++;
    });

    const maxCount = Math.max(...dayOfWeekCounts);
    const mostProductiveDayIndex = dayOfWeekCounts.indexOf(maxCount);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostProductiveDay = maxCount > 0 ? dayNames[mostProductiveDayIndex] : null;

    // ========== RESPONSE ==========
    return NextResponse.json({
      overview: {
        totalSessions: allSessions.length,
        completedSessions: completedSessions.length,
        upcomingSessions: upcomingSessions.length,
        completionRate:
          allSessions.length > 0
            ? Math.round((completedSessions.length / allSessions.length) * 100) / 100
            : 0,
      },
      byType,
      derivedMetrics: {
        averageSpacing,
        currentStreak,
        longestStreak,
        mostProductiveDay,
        totalDaysWithSessions: new Set(
          completedSessions.map((s) => {
            const date = new Date(s.scheduledAt);
            date.setHours(0, 0, 0, 0);
            return date.toISOString();
          })
        ).size,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
