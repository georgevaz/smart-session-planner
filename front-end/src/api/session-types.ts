// API client for session types

import { apiFetch } from './config';

export type SessionType = {
  id: string;
  name: string;
  category: string;
  priority: number; // 1-5
  createdAt: string;
  updatedAt: string;
  completedCount: number; // Number of completed sessions
};

export type CreateSessionType = {
  name: string;
  category: string;
  priority: number;
};

export type UpdateSessionType = Partial<CreateSessionType>;

// ==================== SESSION TYPES API ====================

// GET /api/session-types - List all session types
export async function getSessionTypes(): Promise<SessionType[]> {
  return apiFetch<SessionType[]>('/api/session-types');
}

// GET /api/session-types/[id] - Get a single session type
export async function getSessionType(id: string): Promise<SessionType> {
  return apiFetch<SessionType>(`/api/session-types/${id}`);
}

// POST /api/session-types - Create a new session type
export async function createSessionType(
  data: CreateSessionType
): Promise<SessionType> {
  return apiFetch<SessionType>('/api/session-types', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PUT /api/session-types/[id] - Update a session type
export async function updateSessionType(
  id: string,
  data: UpdateSessionType
): Promise<SessionType> {
  return apiFetch<SessionType>(`/api/session-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE /api/session-types/[id] - Delete a session type
export async function deleteSessionType(id: string): Promise<void> {
  return apiFetch<void>(`/api/session-types/${id}`, {
    method: 'DELETE',
  });
}

// ==================== HELPER FUNCTIONS ====================

// Get priority label
export function getPriorityLabel(priority: number): string {
  const labels: Record<number, string> = {
    1: 'Very Low',
    2: 'Low',
    3: 'Medium',
    4: 'High',
    5: 'Very High',
  };
  return labels[priority] || 'Unknown';
}

// Get priority color (for UI)
export function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = {
    1: '#94A3B8', // slate-400
    2: '#60A5FA', // blue-400
    3: '#FBBF24', // amber-400
    4: '#FB923C', // orange-400
    5: '#EF4444', // red-500
  };
  return colors[priority] || '#94A3B8';
}
