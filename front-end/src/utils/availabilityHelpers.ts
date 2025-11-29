import { AvailabilityWindow } from '../api/availability';

function getShortDayName(dayOfWeek: number): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayOfWeek] || '';
}

function getTimePeriod(time: string): string {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function groupConsecutiveDays(days: number[]): string {
  if (days.length === 0) return '';
  if (days.length === 1) return getShortDayName(days[0]);

  const sorted = [...days].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      if (end - start >= 2) {
        ranges.push(`${getShortDayName(start)}–${getShortDayName(end)}`);
      } else if (end === start) {
        ranges.push(getShortDayName(start));
      } else {
        ranges.push(getShortDayName(start));
        ranges.push(getShortDayName(end));
      }
      if (i < sorted.length) {
        start = sorted[i];
        end = sorted[i];
      }
    }
  }

  return ranges.join(', ');
}

export function summarizeAvailability(windows: AvailabilityWindow[]): string {
  if (windows.length === 0) return 'No availability set';

  const byPeriod: Record<string, Set<number>> = {
    morning: new Set(),
    afternoon: new Set(),
    evening: new Set(),
  };

  windows.forEach(w => {
    const period = getTimePeriod(w.startTime);
    byPeriod[period].add(w.dayOfWeek);
  });

  const parts: string[] = [];

  ['morning', 'afternoon', 'evening'].forEach(period => {
    const days = Array.from(byPeriod[period]);
    if (days.length > 0) {
      const dayStr = groupConsecutiveDays(days);
      const suffix = days.length === 1 ? period : `${period}s`;
      parts.push(`${dayStr} ${suffix}`);
    }
  });

  return parts.join(', ');
}

export function getWeekAvailability(windows: AvailabilityWindow[]): boolean[] {
  const availability = [false, false, false, false, false, false, false];
  windows.forEach(w => {
    const index = w.dayOfWeek === 0 ? 6 : w.dayOfWeek - 1;
    availability[index] = true;
  });
  return availability;
}
