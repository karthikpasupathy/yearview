'use client';

import { Event, Category, CustomHoliday } from '@/lib/instant';
import { getAllDatesInYear, formatDate, getMonthName, parseDateString } from '@/lib/dateUtils';
import DayCell from './DayCell';
import { useMemo } from 'react';

interface YearGridProps {
  year: number;
  events: Event[];
  categories: Category[];
  visibleCategoryIds: Set<string>;
  customHolidays?: CustomHoliday[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
  showHolidays?: boolean;
  showLongWeekends?: boolean;
  showPastDatesAsGray?: boolean;
}

export default function YearGrid({
  year,
  events,
  categories,
  visibleCategoryIds,
  customHolidays = [],
  onDayClick,
  onEventClick,
  showHolidays = true,
  showLongWeekends = true,
  showPastDatesAsGray = true,
}: YearGridProps) {
  const dates = useMemo(() => getAllDatesInYear(year), [year]);

  // Get visible events only
  const visibleEvents = useMemo(() => {
    return events.filter(event => visibleCategoryIds.has(event.categoryId));
  }, [events, visibleCategoryIds]);

  // Group dates by month
  const datesByMonth = useMemo(() => {
    const months: Date[][] = Array.from({ length: 12 }, () => []);
    dates.forEach(date => {
      months[date.getMonth()].push(date);
    });
    return months;
  }, [dates]);

  // Calculate event positions for each month
  const getMonthEvents = useMemo(() => {
    return (monthIndex: number) => {
      const monthStart = new Date(year, monthIndex, 1);
      const monthEnd = new Date(year, monthIndex + 1, 0);

      return visibleEvents
        .filter(event => {
          const eventStart = parseDateString(event.date);
          const eventEnd = event.endDate ? parseDateString(event.endDate) : eventStart;
          return eventStart <= monthEnd && eventEnd >= monthStart;
        })
        .map(event => {
          const eventStart = parseDateString(event.date);
          const eventEnd = event.endDate ? parseDateString(event.endDate) : eventStart;

          // Calculate start position (1-based day of month)
          const startDay = eventStart.getMonth() === monthIndex ? eventStart.getDate() : 1;
          const endDay = eventEnd.getMonth() === monthIndex ? eventEnd.getDate() : new Date(year, monthIndex + 1, 0).getDate();

          return {
            ...event,
            startDay,
            endDay,
            span: endDay - startDay + 1
          };
        });
    };
  }, [year, visibleEvents]);

  return (
    <div className="space-y-0 pb-4">
      {datesByMonth.map((monthDates, monthIndex) => {
        if (monthDates.length === 0) return null;

        const monthEvents = getMonthEvents(monthIndex);
        // Calculate height based on number of events (minimum 60px, +20px per event)
        const cellHeight = Math.max(60, 40 + (monthEvents.length * 20));

        return (
          <div key={monthIndex} className="bg-white border-b border-neutral-200 flex">
            {/* Month Label on Left */}
            <div className="bg-neutral-50 px-2 md:px-3 py-2 border-r border-neutral-200 flex items-center justify-center min-w-[40px] md:min-w-[60px]">
              <h3 className="text-[10px] md:text-xs font-semibold text-neutral-600" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                {getMonthName(monthIndex)}
              </h3>
            </div>

            {/* Scrollable container for mobile */}
            <div className="flex-1 relative calendar-mobile-scroll">
              {/* Day cells grid - min-width ensures scrollability on mobile */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: 'repeat(31, minmax(0, 1fr))',
                  height: `${cellHeight}px`,
                  minWidth: '620px' // Ensures minimum width for mobile scrolling
                }}
              >
                {Array.from({ length: 31 }, (_, dayIndex) => {
                  const date = monthDates.find(d => d.getDate() === dayIndex + 1);

                  if (!date) {
                    return (
                      <div key={dayIndex} className="h-full bg-neutral-50 border-r border-neutral-100"></div>
                    );
                  }

                  return (
                    <DayCell
                      key={formatDate(date)}
                      date={date}
                      events={[]}
                      categories={categories}
                      visibleCategoryIds={visibleCategoryIds}
                      customHolidays={customHolidays}
                      onDayClick={onDayClick}
                      showHolidays={showHolidays}
                      showLongWeekends={showLongWeekends}
                      showPastDatesAsGray={showPastDatesAsGray}
                    />
                  );
                })}
              </div>

              {/* Event overlay bars */}
              <div
                className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
                style={{ minWidth: '620px' }}
              >
                {monthEvents.map((event, idx) => {
                  const category = categories.find(c => c.id === event.categoryId);
                  if (!category) return null;

                  const leftPercent = ((event.startDay - 1) / 31) * 100;
                  const widthPercent = (event.span / 31) * 100;

                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="absolute h-[16px] md:h-[18px] rounded-md px-1 md:px-2 py-0.5 text-[10px] md:text-xs font-semibold pointer-events-auto cursor-pointer hover:opacity-90 transition-opacity truncate flex items-center"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        top: `${20 + (idx * 20)}px`,
                        backgroundColor: category.color,
                        color: 'white',
                      }}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

