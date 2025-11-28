// API client for sessions and suggestions

import { API_URL, apiFetch } from './config';

export type SessionType = {
  id: string;
  name: string;
  category: string;
  priority: number;
};

export type Session = {
  id: string;
  sessionTypeId: string;
  sessionType: SessionType;
  scheduledAt: string;
  duration: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSession = {
  sessionTypeId: string;
  scheduledAt: string; // ISO 8601 date string
  duration: number;
  checkConflict?: boolean;
};

export type UpdateSession = {
  completed?: boolean;
  scheduledAt?: string;
  duration?: number;
};

export type Suggestion = {
  rank: number;
  sessionType: SessionType;
  suggestedStart: string;
  suggestedEnd: string;
  duration: number;
  score: number;
  reasons: string[];
};

export type SuggestionsResponse = {
  suggestions: Suggestion[];
  sessionTypeStats: {
    name: string;
    priority: number;
    upcomingCount: number;
    completedCount: number;
    averageSpacingDays: number | null;
  };
};

// ==================== SESSIONS API ====================

// GET /api/sessions - List sessions
export async function getSessions(params?: {
  upcoming?: boolean;
  startDate?: string;
  endDate?: string;
}): Promise<Session[]> {
  const searchParams = new URLSearchParams();
  if (params?.upcoming) searchParams.set('upcoming', 'true');
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  const url = `${API_URL}/api/sessions${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }
  return response.json();
}

// GET /api/sessions/[id] - Get single session
export async function getSession(id: string): Promise<Session> {
  const response = await fetch(`${API_URL}/api/sessions/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }
  return response.json();
}

// POST /api/sessions - Create a session
export async function createSession(data: CreateSession): Promise<Session> {
  const response = await fetch(`${API_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create session');
  }
  return response.json();
}

// PUT /api/sessions/[id] - Update a session
export async function updateSession(
  id: string,
  data: UpdateSession
): Promise<Session> {
  const response = await fetch(`${API_URL}/api/sessions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update session');
  }
  return response.json();
}

// DELETE /api/sessions/[id] - Delete a session
export async function deleteSession(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/sessions/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete session');
  }
}

// ==================== SUGGESTIONS API ====================

// GET /api/suggestions - Get smart suggestions
export async function getSuggestions(params: {
  sessionTypeId: string;
  duration?: number;
  daysAhead?: number;
  limit?: number;
}): Promise<SuggestionsResponse> {
  const searchParams = new URLSearchParams({
    sessionTypeId: params.sessionTypeId,
    duration: (params.duration || 60).toString(),
    daysAhead: (params.daysAhead || 7).toString(),
    limit: (params.limit || 5).toString(),
  });

  const response = await fetch(
    `${API_URL}/api/suggestions?${searchParams.toString()}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch suggestions');
  }
  return response.json();
}

// POST /api/suggestions/accept - Accept a suggestion and create session
export async function acceptSuggestion(params: {
  sessionTypeId: string;
  scheduledAt: string;
  duration: number;
}): Promise<Session> {
  const response = await fetch(`${API_URL}/api/suggestions/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to accept suggestion');
  }
  return response.json();
}

// ==================== HELPER FUNCTIONS ====================

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Format time for display
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Format date and time range
export function formatDateTimeRange(start: string, end: string): string {
  return `${formatDate(start)} · ${formatTime(start)}–${formatTime(end)}`;
}

// Get relative day description (Today, Tomorrow, etc.)
export function getRelativeDay(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return formatDate(dateString);
}
