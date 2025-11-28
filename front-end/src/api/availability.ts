// API client for availability windows

import { API_URL, apiFetch } from './config';

export type AvailabilityWindow = {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  createdAt: string;
  updatedAt: string;
};

export type CreateAvailabilityWindow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type UpdateAvailabilityWindow = Partial<CreateAvailabilityWindow>;

// GET /api/availability - List all availability windows
export async function getAvailabilityWindows(): Promise<AvailabilityWindow[]> {
  const response = await fetch(`${API_URL}/api/availability`);
  if (!response.ok) {
    throw new Error('Failed to fetch availability windows');
  }
  return response.json();
}

// POST /api/availability - Create a new availability window
export async function createAvailabilityWindow(
  data: CreateAvailabilityWindow
): Promise<AvailabilityWindow> {
  const response = await fetch(`${API_URL}/api/availability`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create availability window');
  }
  return response.json();
}

// PUT /api/availability/[id] - Update an availability window
export async function updateAvailabilityWindow(
  id: string,
  data: UpdateAvailabilityWindow
): Promise<AvailabilityWindow> {
  const response = await fetch(`${API_URL}/api/availability/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update availability window');
  }
  return response.json();
}

// DELETE /api/availability/[id] - Delete an availability window
export async function deleteAvailabilityWindow(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/availability/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete availability window');
  }
}

// Helper function to get day name from dayOfWeek number
export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || '';
}

// Helper function to get short day name
export function getShortDayName(dayOfWeek: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek] || '';
}
