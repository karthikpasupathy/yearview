/**
 * Holiday data and utilities for India and US major holidays
 * 
 * This module provides functions to check if a date is a holiday
 * and to highlight extended weekends when holidays fall on Friday/Monday.
 */

import { formatDate } from './dateUtils';

// Holiday definition with name and date
interface Holiday {
    name: string;
    date: string; // YYYY-MM-DD format
}

export interface CustomHoliday {
    id: string;
    date: string;
    note: string;
}

// US Major Holidays for 2025 and 2026
const US_HOLIDAYS: Record<number, Holiday[]> = {
    2025: [
        { name: "New Year's Day", date: '2025-01-01' },
        { name: 'Martin Luther King Jr. Day', date: '2025-01-20' }, // 3rd Monday
        { name: "Presidents' Day", date: '2025-02-17' }, // 3rd Monday
        { name: 'Memorial Day', date: '2025-05-26' }, // Last Monday
        { name: 'Independence Day', date: '2025-07-04' },
        { name: 'Labor Day', date: '2025-09-01' }, // 1st Monday
        { name: 'Thanksgiving', date: '2025-11-27' }, // 4th Thursday
        { name: 'Christmas', date: '2025-12-25' },
    ],
    2026: [
        { name: "New Year's Day", date: '2026-01-01' },
        { name: 'Martin Luther King Jr. Day', date: '2026-01-19' }, // 3rd Monday
        { name: "Presidents' Day", date: '2026-02-16' }, // 3rd Monday
        { name: 'Memorial Day', date: '2026-05-25' }, // Last Monday
        { name: 'Independence Day', date: '2026-07-04' },
        { name: 'Labor Day', date: '2026-09-07' }, // 1st Monday
        { name: 'Thanksgiving', date: '2026-11-26' }, // 4th Thursday
        { name: 'Christmas', date: '2026-12-25' },
    ],
};

// India Major Holidays for 2025 and 2026
const INDIA_HOLIDAYS: Record<number, Holiday[]> = {
    2025: [
        { name: "New Year's Eve", date: '2024-12-31' }, // For 2025 calendar, show previous year's NYE
        { name: 'Pongal / Makar Sankranti', date: '2025-01-14' },
        { name: 'Republic Day', date: '2025-01-26' },
        { name: 'Holi', date: '2025-03-14' },
        { name: 'Ramzan / Eid ul-Fitr', date: '2025-03-31' },
        { name: 'Labor Day', date: '2025-05-01' },
        { name: 'Bakrid / Eid ul-Adha', date: '2025-06-07' },
        { name: 'Independence Day', date: '2025-08-15' },
        { name: 'Gandhi Jayanti', date: '2025-10-02' },
        { name: 'Dussehra', date: '2025-10-12' },
        { name: 'Diwali', date: '2025-10-20' },
        { name: 'Christmas', date: '2025-12-25' },
        { name: "New Year's Eve", date: '2025-12-31' },
    ],
    2026: [
        { name: 'Pongal / Makar Sankranti', date: '2026-01-14' },
        { name: 'Republic Day', date: '2026-01-26' },
        { name: 'Holi', date: '2026-03-03' },
        { name: 'Ramzan / Eid ul-Fitr', date: '2026-03-20' },
        { name: 'Labor Day', date: '2026-05-01' },
        { name: 'Bakrid / Eid ul-Adha', date: '2026-05-27' },
        { name: 'Independence Day', date: '2026-08-15' },
        { name: 'Gandhi Jayanti', date: '2026-10-02' },
        { name: 'Dussehra', date: '2026-10-01' },
        { name: 'Diwali', date: '2026-11-08' },
        { name: 'Christmas', date: '2026-12-25' },
        { name: "New Year's Eve", date: '2026-12-31' },
    ],
};

/**
 * Get all holidays for a given year (combined US + India + Custom)
 */
export function getHolidaysForYear(year: number, customHolidays: CustomHoliday[] = []): Holiday[] {
    const usHolidays = US_HOLIDAYS[year] || [];
    const indiaHolidays = INDIA_HOLIDAYS[year] || [];

    // Convert custom holidays to Holiday format
    const custom: Holiday[] = customHolidays
        .filter(h => new Date(h.date).getFullYear() === year)
        .map(h => ({ name: h.note, date: h.date }));

    return [...usHolidays, ...indiaHolidays, ...custom];
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date, customHolidays: CustomHoliday[] = []): boolean {
    const dateStr = formatDate(date);
    const year = date.getFullYear();
    const holidays = getHolidaysForYear(year, customHolidays);
    return holidays.some(h => h.date === dateStr);
}

/**
 * Get the holiday name for a date (if it's a holiday)
 */
export function getHolidayName(date: Date, customHolidays: CustomHoliday[] = []): string | null {
    const dateStr = formatDate(date);
    const year = date.getFullYear();
    const holidays = getHolidaysForYear(year, customHolidays);
    const holiday = holidays.find(h => h.date === dateStr);
    return holiday ? holiday.name : null;
}

/**
 * - If a holiday falls on Monday, Saturday and Sunday before it are extended weekend
 */
export function isExtendedWeekend(date: Date, customHolidays: CustomHoliday[] = []): boolean {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Only weekends can be extended weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        return false;
    }

    const year = date.getFullYear();
    const holidays = getHolidaysForYear(year, customHolidays);

    for (const holiday of holidays) {
        const holidayDate = new Date(holiday.date + 'T00:00:00');
        const holidayDayOfWeek = holidayDate.getDay();

        // Holiday on Friday - check if this date is the following Saturday or Sunday
        if (holidayDayOfWeek === 5) {
            const saturday = new Date(holidayDate);
            saturday.setDate(saturday.getDate() + 1);
            const sunday = new Date(holidayDate);
            sunday.setDate(sunday.getDate() + 2);

            if (formatDate(date) === formatDate(saturday) || formatDate(date) === formatDate(sunday)) {
                return true;
            }
        }

        // Holiday on Monday - check if this date is the preceding Saturday or Sunday
        if (holidayDayOfWeek === 1) {
            const saturday = new Date(holidayDate);
            saturday.setDate(saturday.getDate() - 2);
            const sunday = new Date(holidayDate);
            sunday.setDate(sunday.getDate() - 1);

            if (formatDate(date) === formatDate(saturday) || formatDate(date) === formatDate(sunday)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Get the name of the holiday that caused this extended weekend
 */
export function getExtendedWeekendHolidayName(date: Date, customHolidays: CustomHoliday[] = []): string | null {
    const dayOfWeek = date.getDay();

    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        return null;
    }

    const year = date.getFullYear();
    const holidays = getHolidaysForYear(year, customHolidays);

    for (const holiday of holidays) {
        const holidayDate = new Date(holiday.date + 'T00:00:00');
        const holidayDayOfWeek = holidayDate.getDay();

        if (holidayDayOfWeek === 5) {
            const saturday = new Date(holidayDate);
            saturday.setDate(saturday.getDate() + 1);
            const sunday = new Date(holidayDate);
            sunday.setDate(sunday.getDate() + 2);

            if (formatDate(date) === formatDate(saturday) || formatDate(date) === formatDate(sunday)) {
                return `${holiday.name} Weekend`;
            }
        }

        if (holidayDayOfWeek === 1) {
            const saturday = new Date(holidayDate);
            saturday.setDate(saturday.getDate() - 2);
            const sunday = new Date(holidayDate);
            sunday.setDate(sunday.getDate() - 1);

            if (formatDate(date) === formatDate(saturday) || formatDate(date) === formatDate(sunday)) {
                return `${holiday.name} Weekend`;
            }
        }
    }

    return null;
}
