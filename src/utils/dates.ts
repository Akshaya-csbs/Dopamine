/**
 * Date utility helpers for Dopamine Habit Tracker
 */

// Formats a Date object to YYYY-MM-DD in local time
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse YYYY-MM-DD to Date in local time
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Get today's YYYY-MM-DD string
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

// Checks if a dateKey is today
export function isToday(dateKey: string): boolean {
  return dateKey === getTodayKey();
}

// Format date for readable display (e.g. "Tuesday, Oct 20" or "Today, Oct 20")
export function formatFriendlyDate(dateKey: string): string {
  const todayKey = getTodayKey();
  const date = parseDateKey(dateKey);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = formatDateKey(tomorrow);

  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  const dayNumber = date.getDate();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });

  if (dateKey === todayKey) {
    return `Today, ${monthName} ${dayNumber}`;
  } else if (dateKey === yesterdayKey) {
    return `Yesterday, ${monthName} ${dayNumber}`;
  } else if (dateKey === tomorrowKey) {
    return `Tomorrow, ${monthName} ${dayNumber}`;
  }

  return `${weekday}, ${monthName} ${dayNumber}`;
}

// Get array of past N days up to today (inclusive)
export function getPastDays(daysCount: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(formatDateKey(d));
  }

  return dates;
}

// Get the 7 days of the current week (centered or Mon-Sun)
export function getWeekDates(aroundDateKey: string = getTodayKey()): { key: string; label: string; dayNum: number; isToday: boolean }[] {
  const centerDate = parseDateKey(aroundDateKey);
  // Center roughly on 3 days before to 3 days after, or 7 days around
  const result = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + i);
    const key = formatDateKey(d);
    result.push({
      key,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: key === getTodayKey()
    });
  }
  return result;
}

// Add or subtract days from a dateKey
export function offsetDateKey(dateKey: string, daysOffset: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + daysOffset);
  return formatDateKey(date);
}

// Get day of week index: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
export function getDayOfWeek(dateKey: string): number {
  return parseDateKey(dateKey).getDay();
}
