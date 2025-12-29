'use client';

import { Event, Category } from '@/lib/instant';
import { isToday, getDayOfWeek } from '@/lib/dateUtils';

interface DayCellProps {
  date: Date;
  events: Event[];
  categories: Category[];
  visibleCategoryIds: Set<string>;
  onDayClick: (date: Date) => void;
}

export default function DayCell({ date, events, categories, visibleCategoryIds, onDayClick }: DayCellProps) {
  const dayOfWeek = getDayOfWeek(date);
  const isCurrentDay = isToday(date);
  const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday

  return (
    <div
      onClick={() => onDayClick(date)}
      className={`
        relative transition-colors duration-200 cursor-pointer
        h-full hover:bg-neutral-50
        ${isCurrentDay 
          ? 'bg-green-50 border border-green-600' 
          : 'border-r border-neutral-100'
        }
        ${isWeekend && !isCurrentDay ? 'bg-neutral-100' : ''}
        ${!isCurrentDay && !isWeekend ? 'bg-white' : ''}
      `}
    >
      <div className="px-1 py-1">
        <div className={`text-[10px] font-normal ${isCurrentDay ? 'text-green-600 font-semibold' : isWeekend ? 'text-neutral-500' : 'text-neutral-700'}`}>
          <div className="flex items-start justify-between">
            <span>{date.getDate()}</span>
            <span className="text-[8px] opacity-60">{dayOfWeek}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
