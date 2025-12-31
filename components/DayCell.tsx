'use client';

import { Event, Category, CustomHoliday } from '@/lib/instant';
import { isToday, getDayOfWeek, formatDate } from '@/lib/dateUtils';
import { isHoliday, isExtendedWeekend, getHolidayName, getExtendedWeekendHolidayName } from '@/lib/holidays';

interface DayCellProps {
  date: Date;
  events: Event[];
  categories: Category[];
  visibleCategoryIds: Set<string>;
  customHolidays?: CustomHoliday[];
  onDayClick: (date: Date) => void;
  showHolidays?: boolean;
  showLongWeekends?: boolean;
  showPastDatesAsGray?: boolean;
}

export default function DayCell({
  date,
  visibleCategoryIds,
  onDayClick,
  customHolidays = [],
  showHolidays = true,
  showLongWeekends = true,
  showPastDatesAsGray = true,
}: DayCellProps) {
  const dayOfWeek = getDayOfWeek(date);
  const isCurrentDay = isToday(date);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday
  const dateStr = formatDate(date);

  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = date < today;

  // Holiday checks - only if showHolidays is enabled
  const isHolidayDay = showHolidays && isHoliday(date, customHolidays);
  const isExtendedWeekendDay = showLongWeekends && isExtendedWeekend(date, customHolidays);
  const holidayName = showHolidays ? getHolidayName(date, customHolidays) : null;
  const extendedWeekendName = showLongWeekends ? getExtendedWeekendHolidayName(date, customHolidays) : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDayClick(date);
    }
  };

  // Determine background color based on priority
  const getBackgroundClass = () => {
    if (isCurrentDay) return 'bg-green-50 border border-green-600';
    if (isHolidayDay) return 'bg-red-100 border-r border-red-200';
    if (isExtendedWeekendDay) return 'bg-red-50 border-r border-red-100';
    if (isWeekend) return 'bg-neutral-100 border-r border-neutral-100';
    return 'bg-white border-r border-neutral-100';
  };

  // Determine text color based on priority
  const getTextClass = () => {
    if (isCurrentDay) return 'text-green-600 font-semibold';
    if (isHolidayDay) return 'text-red-700 font-semibold';
    if (isExtendedWeekendDay) return 'text-red-600';
    if (isWeekend) return 'text-neutral-500';
    return 'text-neutral-700';
  };

  // Build tooltip/title
  const getTitle = () => {
    const baseTitle = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (holidayName) return `${baseTitle} - ${holidayName}`;
    if (extendedWeekendName) return `${baseTitle} - ${extendedWeekendName}`;
    return baseTitle;
  };

  // Apply past date styling
  const pastOpacity = isPast && showPastDatesAsGray && !isCurrentDay ? 'opacity-50' : '';

  return (
    <div
      onClick={() => onDayClick(date)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={getTitle()}
      title={holidayName || extendedWeekendName || undefined}
      data-day-cell
      data-date={dateStr}
      className={`
        relative transition-colors duration-200 cursor-pointer
        h-full hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
        ${getBackgroundClass()} ${pastOpacity}
      `}
    >
      <div className="px-1 py-1">
        <div className={`text-[10px] font-normal ${getTextClass()}`}>
          <div className="flex items-start justify-between">
            <span>{date.getDate()}</span>
            <span className="text-[8px] opacity-60">{dayOfWeek}</span>
          </div>
          {holidayName && (
            <div className="text-[7px] text-red-600 font-medium truncate mt-0.5 leading-tight">
              {holidayName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
