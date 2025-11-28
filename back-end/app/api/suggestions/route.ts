import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * SMART SUGGESTION ALGORITHM
 *
 * This algorithm generates intelligent time slot suggestions for scheduling sessions.
 * It considers multiple factors to find optimal times:
 *
 * 1. USER AVAILABILITY: Only suggest times within the user's defined availability windows
 * 2. EXISTING SESSIONS: Avoid conflicts with already scheduled sessions
 * 3. PRIORITY: Favor scheduling high-priority session types
 * 4. SPACING/FATIGUE: Apply heuristics to prevent burnout:
 *    - Avoid clustering too many sessions in one day
 *    - Prefer spacing out sessions of the same type
 *    - Give extra weight to sessions that haven't been scheduled recently
 *
 * The algorithm outputs ranked suggestions with explanations for why each slot is recommended.
 */

// ==================== TYPES ====================

type TimeSlot = {
  start: Date;
  end: Date;
  dayOfWeek: number;
};

type ScoredSlot = TimeSlot & {
  score: number;
  reasons: string[];
};

type SessionTypeStats = {
  id: string;
  name: string;
  category: string;
  priority: number;
  lastScheduled: Date | null;
  upcomingCount: number;
  completedCount: number;
  averageSpacingDays: number | null;
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Converts time string (HH:MM) and day of week to a Date object for a specific week
 */
function timeStringToDate(timeStr: string, dayOfWeek: number, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(baseDate);

  // Find the next occurrence of this day of week
  const currentDay = date.getDay();
  const daysUntil = (dayOfWeek - currentDay + 7) % 7;
  date.setDate(date.getDate() + daysUntil);

  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Check if a proposed time slot conflicts with any existing session
 */
function hasConflict(slot: TimeSlot, existingSessions: any[]): boolean {
  return existingSessions.some((session) => {
    const sessionStart = new Date(session.scheduledAt);
    const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60000);

    // Overlap occurs if: slot starts before session ends AND slot ends after session starts
    return slot.start < sessionEnd && slot.end > sessionStart;
  });
}

/**
 * Calculate how many sessions are already scheduled on a given day
 */
function getSessionCountOnDay(date: Date, sessions: any[]): number {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  return sessions.filter((session) => {
    const sessionDate = new Date(session.scheduledAt);
    return sessionDate >= dayStart && sessionDate <= dayEnd;
  }).length;
}

/**
 * Calculate the total "priority load" for a day (sum of all session priorities)
 * This helps us detect days that are already mentally/physically demanding
 */
function getPriorityLoadForDay(date: Date, sessions: any[]): number {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);

  return sessions
    .filter((session) => {
      const sessionDate = new Date(session.scheduledAt);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    })
    .reduce((sum, session) => sum + (session.sessionType?.priority || 0), 0);
}

/**
 * Get statistics about a session type to inform scheduling decisions
 */
async function getSessionTypeStats(sessionTypeId: string): Promise<SessionTypeStats> {
  const sessionType = await prisma.sessionType.findUnique({
    where: { id: sessionTypeId },
    include: {
      sessions: {
        orderBy: { scheduledAt: 'desc' },
      },
    },
  });

  if (!sessionType) {
    throw new Error('Session type not found');
  }

  const now = new Date();
  const upcomingSessions = sessionType.sessions.filter(
    (s) => new Date(s.scheduledAt) >= now && !s.completed
  );
  const completedSessions = sessionType.sessions.filter((s) => s.completed);

  // Find the most recently scheduled session (future or past)
  const lastScheduled = sessionType.sessions.length > 0
    ? sessionType.sessions[0].scheduledAt
    : null;

  // Calculate average spacing between completed sessions
  let averageSpacingDays: number | null = null;
  if (completedSessions.length >= 2) {
    const sortedCompleted = completedSessions
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    let totalSpacing = 0;
    for (let i = 1; i < sortedCompleted.length; i++) {
      const diff = new Date(sortedCompleted[i].scheduledAt).getTime() -
                   new Date(sortedCompleted[i - 1].scheduledAt).getTime();
      totalSpacing += diff / (1000 * 60 * 60 * 24); // Convert to days
    }
    averageSpacingDays = totalSpacing / (sortedCompleted.length - 1);
  }

  return {
    id: sessionType.id,
    name: sessionType.name,
    category: sessionType.category,
    priority: sessionType.priority,
    lastScheduled,
    upcomingCount: upcomingSessions.length,
    completedCount: completedSessions.length,
    averageSpacingDays,
  };
}

// ==================== MAIN ALGORITHM ====================

/**
 * Generate time slot candidates from availability windows over the next N days
 */
async function generateCandidateSlots(
  daysAhead: number,
  sessionDuration: number
): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = [];
  const availabilityWindows = await prisma.availabilityWindow.findMany();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For each day in the next N days
  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + dayOffset);
    const dayOfWeek = currentDate.getDay();

    // Find availability windows for this day of week
    const windowsForDay = availabilityWindows.filter(
      (w) => w.dayOfWeek === dayOfWeek
    );

    // For each availability window, generate candidate slots
    for (const window of windowsForDay) {
      const windowStart = timeStringToDate(window.startTime, dayOfWeek, currentDate);
      const windowEnd = timeStringToDate(window.endTime, dayOfWeek, currentDate);

      // Skip if window is in the past
      if (windowEnd < new Date()) continue;

      // Generate slots within this window (every 30 minutes)
      const slotInterval = 30; // minutes
      let slotStart = new Date(windowStart);

      while (slotStart.getTime() + sessionDuration * 60000 <= windowEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + sessionDuration * 60000);

        // Only include slots that start in the future
        if (slotStart > new Date()) {
          slots.push({
            start: new Date(slotStart),
            end: slotEnd,
            dayOfWeek,
          });
        }

        slotStart = new Date(slotStart.getTime() + slotInterval * 60000);
      }
    }
  }

  return slots;
}

/**
 * Score a time slot based on multiple factors
 * Higher score = better suggestion
 */
async function scoreTimeSlot(
  slot: TimeSlot,
  sessionTypeStats: SessionTypeStats,
  existingSessions: any[]
): Promise<ScoredSlot> {
  let score = 0;
  const reasons: string[] = [];

  // ========== FACTOR 1: PRIORITY ==========
  // Higher priority session types should be scheduled sooner and with better time slots
  const priorityScore = sessionTypeStats.priority * 20;
  score += priorityScore;
  if (sessionTypeStats.priority >= 4) {
    reasons.push(`High priority (${sessionTypeStats.priority}/5) session type`);
  }

  // ========== FACTOR 2: RECENCY ==========
  // Sessions that haven't been scheduled recently get a boost
  if (sessionTypeStats.lastScheduled) {
    const daysSinceLastScheduled =
      (slot.start.getTime() - new Date(sessionTypeStats.lastScheduled).getTime()) /
      (1000 * 60 * 60 * 24);

    // Boost score based on how long it's been
    const recencyScore = Math.min(daysSinceLastScheduled * 5, 50);
    score += recencyScore;

    if (daysSinceLastScheduled >= 2) {
      reasons.push(
        `Good spacing (${daysSinceLastScheduled.toFixed(1)} days since last ${sessionTypeStats.name})`
      );
    }
  } else {
    // Never scheduled before - give a moderate boost
    score += 30;
    reasons.push(`First time scheduling this session type`);
  }

  // ========== FACTOR 3: SPACING CONSISTENCY ==========
  // Try to maintain consistent spacing based on historical patterns
  if (sessionTypeStats.averageSpacingDays && sessionTypeStats.lastScheduled) {
    const daysSinceLastScheduled =
      (slot.start.getTime() - new Date(sessionTypeStats.lastScheduled).getTime()) /
      (1000 * 60 * 60 * 24);

    // Calculate how close this slot is to the ideal spacing
    const spacingDiff = Math.abs(daysSinceLastScheduled - sessionTypeStats.averageSpacingDays);
    const spacingScore = Math.max(0, 30 - spacingDiff * 5);
    score += spacingScore;

    if (spacingDiff < 0.5) {
      reasons.push(
        `Matches your usual ${sessionTypeStats.averageSpacingDays.toFixed(1)}-day spacing pattern`
      );
    }
  }

  // ========== FACTOR 4: DAILY LOAD (FATIGUE PREVENTION) ==========
  // Penalize days that already have many sessions or high priority load
  const sessionsOnDay = getSessionCountOnDay(slot.start, existingSessions);
  const priorityLoadOnDay = getPriorityLoadForDay(slot.start, existingSessions);

  // Penalize based on number of existing sessions
  const sessionCountPenalty = sessionsOnDay * 15;
  score -= sessionCountPenalty;

  // Penalize based on cumulative priority (mental/physical load)
  const priorityLoadPenalty = priorityLoadOnDay * 5;
  score -= priorityLoadPenalty;

  if (sessionsOnDay === 0) {
    reasons.push('No other sessions scheduled this day');
  } else if (sessionsOnDay >= 3) {
    reasons.push(`⚠️ Day already has ${sessionsOnDay} sessions scheduled`);
  }

  if (priorityLoadOnDay >= 15) {
    reasons.push(`⚠️ High priority load already scheduled today (${priorityLoadOnDay})`);
  }

  // ========== FACTOR 5: TIME OF DAY PREFERENCE ==========
  // Slightly favor certain times based on session priority
  // High priority sessions → morning (more energy)
  // Lower priority sessions → afternoon/evening
  const hour = slot.start.getHours();

  if (sessionTypeStats.priority >= 4 && hour >= 6 && hour <= 10) {
    score += 10;
    reasons.push('Morning time slot (ideal for high-priority work)');
  } else if (sessionTypeStats.priority <= 2 && hour >= 14 && hour <= 18) {
    score += 10;
    reasons.push('Afternoon time slot (good for lower-priority activities)');
  }

  // ========== FACTOR 6: URGENCY ==========
  // Sooner is generally better (with diminishing returns)
  const daysUntilSlot =
    (slot.start.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  const urgencyScore = Math.max(0, 40 - daysUntilSlot * 3);
  score += urgencyScore;

  // ========== FACTOR 7: BUFFER TIME ==========
  // Give bonus to slots that have some breathing room before/after
  const hasBufferBefore = !existingSessions.some((session) => {
    const sessionEnd = new Date(
      new Date(session.scheduledAt).getTime() + session.duration * 60000
    );
    const timeDiff = (slot.start.getTime() - sessionEnd.getTime()) / 60000; // minutes
    return timeDiff > 0 && timeDiff < 30;
  });

  const hasBufferAfter = !existingSessions.some((session) => {
    const sessionStart = new Date(session.scheduledAt);
    const timeDiff = (sessionStart.getTime() - slot.end.getTime()) / 60000; // minutes
    return timeDiff > 0 && timeDiff < 30;
  });

  if (hasBufferBefore && hasBufferAfter) {
    score += 15;
    reasons.push('Good buffer time around session');
  }

  return {
    ...slot,
    score,
    reasons,
  };
}

// ==================== API ENDPOINT ====================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionTypeId = searchParams.get('sessionTypeId');
    const duration = parseInt(searchParams.get('duration') || '60');
    const daysAhead = parseInt(searchParams.get('daysAhead') || '7');
    const limit = parseInt(searchParams.get('limit') || '5');

    // Validation
    if (!sessionTypeId) {
      return NextResponse.json(
        { error: 'sessionTypeId query parameter is required' },
        { status: 400 }
      );
    }

    if (duration <= 0 || duration > 480) {
      return NextResponse.json(
        { error: 'duration must be between 1 and 480 minutes' },
        { status: 400 }
      );
    }

    // Get session type stats
    const sessionTypeStats = await getSessionTypeStats(sessionTypeId);

    // Get all existing sessions
    const existingSessions = await prisma.session.findMany({
      where: {
        scheduledAt: {
          gte: new Date(),
        },
      },
      include: {
        sessionType: true,
      },
    });

    // Step 1: Generate all possible time slots from availability windows
    const candidateSlots = await generateCandidateSlots(daysAhead, duration);

    // Step 2: Filter out slots that conflict with existing sessions
    const availableSlots = candidateSlots.filter(
      (slot) => !hasConflict(slot, existingSessions)
    );

    if (availableSlots.length === 0) {
      return NextResponse.json({
        suggestions: [],
        message: 'No available time slots found within your availability windows',
      });
    }

    // Step 3: Score each available slot
    const scoredSlots = await Promise.all(
      availableSlots.map((slot) =>
        scoreTimeSlot(slot, sessionTypeStats, existingSessions)
      )
    );

    // Step 4: Sort by score (highest first) and take top N
    const topSuggestions = scoredSlots
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((slot, index) => ({
        rank: index + 1,
        sessionType: {
          id: sessionTypeStats.id,
          name: sessionTypeStats.name,
          category: sessionTypeStats.category,
          priority: sessionTypeStats.priority,
        },
        suggestedStart: slot.start,
        suggestedEnd: slot.end,
        duration,
        score: Math.round(slot.score),
        reasons: slot.reasons,
      }));

    return NextResponse.json({
      suggestions: topSuggestions,
      sessionTypeStats: {
        name: sessionTypeStats.name,
        priority: sessionTypeStats.priority,
        upcomingCount: sessionTypeStats.upcomingCount,
        completedCount: sessionTypeStats.completedCount,
        averageSpacingDays: sessionTypeStats.averageSpacingDays,
      },
    });
  } catch (error: any) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
