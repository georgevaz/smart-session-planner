// API client for progress/stats

import { apiFetch } from './config';

export type SessionTypeBreakdown = {
  id: string;
  name: string;
  category: string;
  priority: number;
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  completionRate: number; // 0-1
};

export type DerivedMetrics = {
  averageSpacing: number | null; // Average days between sessions
  currentStreak: number; // Current consecutive days with sessions
  longestStreak: number; // Best streak ever achieved
  mostProductiveDay: string | null; // Day of week with most completions
  totalDaysWithSessions: number; // Unique days with sessions
};

export type StatsOverview = {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  completionRate: number; // 0-1
};

export type Stats = {
  overview: StatsOverview;
  byType: SessionTypeBreakdown[];
  derivedMetrics: DerivedMetrics;
};

// ==================== STATS API ====================

// GET /api/stats - Get overall progress and statistics
export async function getStats(): Promise<Stats> {
  return apiFetch<Stats>('/api/stats');
}

// ==================== HELPER FUNCTIONS ====================

// Format completion rate as percentage
export function formatCompletionRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

// Format average spacing
export function formatAverageSpacing(days: number | null): string {
  if (days === null) return 'N/A';
  if (days < 1) return 'Less than 1 day';
  if (days === 1) return '1 day';
  return `${days.toFixed(1)} days`;
}

// Format streak
export function formatStreak(days: number): string {
  if (days === 0) return 'No streak';
  if (days === 1) return '1 day';
  return `${days} days`;
}

// Get encouragement message based on current streak
export function getStreakMessage(currentStreak: number, longestStreak: number): string {
  if (currentStreak === 0) {
    return 'Start a new streak today!';
  }
  if (currentStreak === longestStreak) {
    return `🔥 You're on your best streak ever!`;
  }
  if (currentStreak >= 7) {
    return `🎉 Great momentum! Keep it up!`;
  }
  if (currentStreak >= 3) {
    return '💪 Building a solid habit!';
  }
  return '✨ Off to a good start!';
}
