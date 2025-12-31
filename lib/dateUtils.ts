/**
 * Date utility functions with timezone-safe operations
 * 
 * IMPORTANT: Event dates are stored as YYYY-MM-DD strings representing LOCAL dates.
 * All parsing should create local Date objects, not UTC.
 */

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get the number of days in a year
 */
export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * Get all dates in a year (timezone-safe, uses local time)
 */
export function getAllDatesInYear(year: number): Date[] {
  const dates: Date[] = [];
  const daysInYear = getDaysInYear(year);

  for (let i = 0; i < daysInYear; i++) {
    // Create date in local timezone
    const date = new Date(year, 0, 1 + i);
    dates.push(date);
  }

  return dates;
}

/**
 * Format date to YYYY-MM-DD string (timezone-safe)
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date string (YYYY-MM-DD) to local Date object
 * IMPORTANT: This creates a date in LOCAL time, not UTC
 * to avoid timezone offset issues
 */
export function parseDateString(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Using new Date(year, month-1, day) creates a LOCAL date
  return new Date(year, month - 1, day);
}

/**
 * Safely compare two date strings or a date with a string
 * Returns true if eventDate falls within the range (inclusive)
 */
export function isDateInRange(
  eventDate: string,
  rangeStart: string,
  rangeEnd: string
): boolean {
  return eventDate >= rangeStart && eventDate <= rangeEnd;
}

/**
 * Get day of week abbreviation
 */
export function getDayOfWeek(date: Date): string {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  return days[date.getDay()];
}

/**
 * Get full day of week name
 */
export function getDayOfWeekFull(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Get month abbreviation
 */
export function getMonthName(monthIndex: number): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[monthIndex];
}

/**
 * Get full month name
 */
export function getMonthNameFull(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

/**
 * Check if a date is today (timezone-safe)
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Legacy alias for parseDateString
 * @deprecated Use parseDateString instead
 */
export const parseDate = parseDateString;

/**
 * Group dates by month
 */
export function groupDatesByMonth(dates: Date[]): Map<number, Date[]> {
  const grouped = new Map<number, Date[]>();

  dates.forEach(date => {
    const month = date.getMonth();
    if (!grouped.has(month)) {
      grouped.set(month, []);
    }
    grouped.get(month)!.push(date);
  });

  return grouped;
}

/**
 * Format a date string for display (short format)
 */
export function formatDateForDisplay(dateString: string): string {
  const date = parseDateString(dateString);
  return `${getMonthName(date.getMonth())} ${date.getDate()}`;
}

