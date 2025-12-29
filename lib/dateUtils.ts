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
 * Get all dates in a year
 */
export function getAllDatesInYear(year: number): Date[] {
  const dates: Date[] = [];
  const startDate = new Date(year, 0, 1);
  const daysInYear = getDaysInYear(year);

  for (let i = 0; i < daysInYear; i++) {
    const date = new Date(year, 0, 1);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }

  return dates;
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get day of week abbreviation
 */
export function getDayOfWeek(date: Date): string {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
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
 * Check if a date is today
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
 * Parse date string (YYYY-MM-DD) to Date
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

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
