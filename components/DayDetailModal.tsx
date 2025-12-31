'use client';

import { useState, useEffect } from 'react';

import { Event, Category, CustomHoliday, DayNote } from '@/lib/instant';
import { getDayOfWeek, getMonthName, formatDate } from '@/lib/dateUtils';
import { getHolidayName, isExtendedWeekend, getExtendedWeekendHolidayName } from '@/lib/holidays';
import { useFocusTrap } from '@/hooks/useAccessibility';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  events: Event[];
  categories: Category[];
  customHolidays?: CustomHoliday[];
  dayNotes?: DayNote[];
  onEditEvent: (event: Event) => void;
  onAddEvent: () => void;
  onSaveHoliday?: (holiday: Partial<CustomHoliday>) => void;
  onDeleteHoliday?: (id: string) => void;
  onSaveDayNote?: (note: Partial<DayNote>) => void;
  onDeleteDayNote?: (id: string) => void;
}

export default function DayDetailModal({
  isOpen,
  onClose,
  date,
  events,
  categories,
  customHolidays = [],
  dayNotes = [],
  onEditEvent,
  onAddEvent,
  onSaveHoliday,
  onDeleteHoliday,
  onSaveDayNote,
  onDeleteDayNote,
}: DayDetailModalProps) {
  const focusTrapRef = useFocusTrap(isOpen, onClose);

  // Find if there is a custom holiday for this date
  const dateStr = date ? formatDate(date) : '';
  const currentHoliday = customHolidays.find(h => h.date === dateStr);
  const currentNote = dayNotes.find(n => n.date === dateStr);

  const [holidayNote, setHolidayNote] = useState('');
  const [dayNoteText, setDayNoteText] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);

  useEffect(() => {
    if (currentHoliday) {
      setHolidayNote(currentHoliday.note);
    } else {
      setHolidayNote('');
    }
  }, [currentHoliday]);

  useEffect(() => {
    if (currentNote) {
      setDayNoteText(currentNote.note);
      setIsHighlighted(currentNote.isHighlighted);
      setIsNoteExpanded(true);
    } else {
      setDayNoteText('');
      setIsHighlighted(false);
      setIsNoteExpanded(false);
    }
  }, [currentNote]);

  const handleHolidayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!date || !onSaveHoliday || !onDeleteHoliday) return;

    if (e.target.checked) {
      // Create new holiday
      onSaveHoliday({
        date: dateStr,
        note: 'Custom Holiday'
      });
    } else {
      // Delete existing holiday
      if (currentHoliday) {
        onDeleteHoliday(currentHoliday.id);
      }
    }
  };

  const handleSaveHolidayNote = () => {
    if (!date || !onSaveHoliday || !currentHoliday) return;
    onSaveHoliday({
      id: currentHoliday.id,
      date: dateStr,
      note: holidayNote
    });
  };

  const handleSaveDayNoteWrapper = () => {
    if (!date || !onSaveDayNote) return;

    // If text is empty and highlight is off, treat as delete
    if (!dayNoteText.trim() && !isHighlighted && currentNote) {
      onDeleteDayNote && onDeleteDayNote(currentNote.id);
      return;
    }

    onSaveDayNote({
      id: currentNote?.id,
      date: dateStr,
      note: dayNoteText,
      isHighlighted: isHighlighted
    });
  };

  const toggleHighlight = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsHighlighted(e.target.checked);
    // Auto-save when toggling highlight if note exists or just saving highlight
    if (currentNote) {
      onSaveDayNote && onSaveDayNote({
        ...currentNote,
        isHighlighted: e.target.checked,
        updatedAt: Date.now()
      });
    }
  };

  if (!isOpen || !date) return null;

  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const dayOfWeek = getDayOfWeek(date);
  const monthName = getMonthName(date.getMonth());

  // Holiday info
  const holidayName = getHolidayName(date);
  const isExtendedWeekendDay = isExtendedWeekend(date);
  const extendedWeekendName = getExtendedWeekendHolidayName(date);

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
              {holidayName && (
                <div className="mt-2 inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  🎉 {holidayName}
                </div>
              )}
              {!holidayName && isExtendedWeekendDay && extendedWeekendName && (
                <div className="mt-2 inline-flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                  🗓️ {extendedWeekendName}
                </div>
              )}
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

          <div className="mt-4 pt-4 border-t border-neutral-100 space-y-4">
            {/* Day Note Section */}
            <div>
              {!isNoteExpanded && !currentNote ? (
                <button
                  onClick={() => setIsNoteExpanded(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Add Note
                </button>
              ) : (
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div className="flex justify-between items-start mb-2">
                    <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wider">Day Note</label>
                    <button
                      onClick={() => {
                        if (!currentNote) {
                          setIsNoteExpanded(false);
                          setDayNoteText('');
                          setIsHighlighted(false);
                        }
                      }}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <textarea
                    value={dayNoteText}
                    onChange={(e) => setDayNoteText(e.target.value.slice(0, 100))}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white mb-2"
                    placeholder="Add a note... (max 100 chars)"
                    rows={2}
                    maxLength={100}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="highlight-day"
                        checked={isHighlighted}
                        onChange={toggleHighlight}
                        className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="highlight-day" className="text-xs font-medium text-stone-600 cursor-pointer select-none">
                        Highlight Day
                      </label>
                    </div>
                    <button
                      onClick={handleSaveDayNoteWrapper}
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Save Note
                    </button>
                  </div>
                  <div className="text-[10px] text-right text-stone-400 mt-1">
                    {dayNoteText.length}/100
                  </div>
                </div>
              )}
            </div>

            {/* Custom Holiday Section */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  id="is-holiday"
                  checked={!!currentHoliday}
                  onChange={handleHolidayChange}
                  className="rounded border-neutral-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="is-holiday" className="text-sm font-medium text-stone-700 select-none cursor-pointer">
                  Mark as Holiday
                </label>
              </div>

              {currentHoliday && (
                <div className="pl-6">
                  <label className="block text-xs font-medium text-stone-500 mb-1">Holiday Name</label>
                  <div className="flex gap-2">
                    <textarea
                      value={holidayNote}
                      onChange={(e) => setHolidayNote(e.target.value)}
                      className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400"
                      placeholder="Enter holiday name..."
                      rows={1}
                    />
                    <button
                      onClick={handleSaveHolidayNote}
                      className="px-4 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
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
