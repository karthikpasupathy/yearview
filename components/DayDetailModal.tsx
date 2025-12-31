'use client';

import { Event, Category } from '@/lib/instant';
import { getDayOfWeek, getMonthName } from '@/lib/dateUtils';
import { useFocusTrap } from '@/hooks/useAccessibility';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: Event[];
  categories: Category[];
  onEditEvent: (event: Event) => void;
  onAddEvent: () => void;
}

export default function DayDetailModal({
  isOpen,
  onClose,
  date,
  events,
  categories,
  onEditEvent,
  onAddEvent,
}: DayDetailModalProps) {
  const focusTrapRef = useFocusTrap(isOpen, onClose);

  if (!isOpen || !date) return null;

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const dayOfWeek = getDayOfWeek(date);
  const monthName = getMonthName(date.getMonth());

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-detail-modal-title"
    >
      <div
        ref={focusTrapRef}
        className="bg-white/95 backdrop-blur-md rounded-3xl border border-neutral-200/50 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-neutral-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="day-detail-modal-title" className="text-3xl font-light tracking-tight text-stone-700">
                {monthName} {date.getDate()}, {date.getFullYear()}
              </h2>
              <p className="text-stone-500 mt-1 font-light">{dayOfWeek}</p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-stone-500 mb-4 font-light">No events on this day</p>
              <button
                onClick={onAddEvent}
                className="px-6 py-2 bg-stone-800 text-white rounded-xl font-light hover:bg-stone-700 transition-all"
              >
                Add Event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const category = categoryMap.get(event.categoryId);
                return (
                  <div
                    key={event.id}
                    onClick={() => onEditEvent(event)}
                    className="p-4 rounded-2xl border cursor-pointer hover:shadow-sm transition-all"
                    style={{
                      backgroundColor: category?.color + '20',
                      borderColor: category?.color + '40',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category?.color }}
                          ></div>
                          <span
                            className="text-xs font-light px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: category?.color + '30',
                              color: category?.color,
                            }}
                          >
                            {category?.name}
                          </span>
                        </div>
                        <h3 className="text-lg font-light text-stone-700 mb-1">
                          {event.title}
                          {event.endDate && event.endDate !== event.date && (
                            <span className="text-xs text-stone-400 ml-2">
                              → {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </h3>
                        {event.description && (
                          <p className="text-stone-500 text-sm font-light">{event.description}</p>
                        )}
                      </div>
                      <svg
                        className="w-5 h-5 text-stone-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={onAddEvent}
                className="w-full py-3 border border-dashed border-neutral-300 text-stone-500 rounded-2xl font-light hover:border-neutral-400 hover:text-stone-700 hover:bg-stone-50 transition-all"
              >
                + Add Another Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
