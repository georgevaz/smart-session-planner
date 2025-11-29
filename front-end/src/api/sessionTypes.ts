// API client for session types

import { API_URL } from './config';

export type SessionType = {
  id: string;
  name: string;
  category: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  completedCount: number;
};

// GET /api/session-types - List all session types
export async function getSessionTypes(): Promise<SessionType[]> {
  const response = await fetch(`${API_URL}/api/session-types`);

  if (!response.ok) {
    throw new Error('Failed to fetch session types');
  }
  return response.json();
}
