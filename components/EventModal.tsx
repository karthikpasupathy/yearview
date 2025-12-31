'use client';

import { Event, Category } from '@/lib/instant';
import { formatDate } from '@/lib/dateUtils';
import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useFocusTrap } from '@/hooks/useAccessibility';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<Event>) => void;
  onDelete?: (eventId: string) => void;
  event?: Event | null;
  categories: Category[];
  selectedDate?: Date | null;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  categories,
  selectedDate,
}: EventModalProps) {
  const { showToast, showConfirm } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Focus trap must be called unconditionally to maintain hook order
  const focusTrapRef = useFocusTrap(isOpen, onClose);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setDate(event.date);
      setEndDate(event.endDate || '');
      setCategoryId(event.categoryId);
    } else if (selectedDate) {
      setDate(formatDate(selectedDate));
      setTitle('');
      setDescription('');
      setEndDate('');
      setCategoryId(categories[0]?.id || '');
    } else {
      setTitle('');
      setDescription('');
      setDate('');
      setEndDate('');
      setCategoryId(categories[0]?.id || '');
    }
  }, [event, selectedDate, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !date || !categoryId) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    // Validate end date is after start date
    if (endDate && endDate < date) {
      showToast('End date must be after start date', 'warning');
      return;
    }

    onSave({
      id: event?.id,
      title: title.trim(),
      description: description.trim(),
      date,
      endDate: endDate || undefined,
      categoryId,
    });

    onClose();
  };

  const handleDelete = () => {
    if (event && onDelete) {
      showConfirm('Are you sure you want to delete this event?', () => {
        onDelete(event.id);
        onClose();
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div
        ref={focusTrapRef}
        className="bg-white rounded-3xl border border-neutral-300 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <h2 id="event-modal-title" className="text-2xl font-semibold tracking-tight text-neutral-900">
              {event ? 'Edit Event' : 'Add Event'}
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-400 focus:border-transparent outline-none transition-all text-neutral-900 font-normal bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-light text-stone-600 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description (optional)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-1 focus:ring-neutral-300 focus:border-transparent outline-none transition-all resize-none text-stone-700 font-light bg-white/50"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-light text-stone-600 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-1 focus:ring-neutral-300 focus:border-transparent outline-none transition-all text-stone-700 font-light bg-white/50"
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-light text-stone-600 mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={date}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-1 focus:ring-neutral-300 focus:border-transparent outline-none transition-all text-stone-700 font-light bg-white/50"
            />
            <p className="text-xs text-stone-400 mt-1 font-light">Leave empty for single-day events</p>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-light text-stone-600 mb-2">
              Category *
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-1 focus:ring-neutral-300 focus:border-transparent outline-none transition-all text-stone-700 font-light bg-white/50"
              required
            >
              {categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center justify-between pt-4">
            {event && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-light hover:bg-red-100 transition-all border border-red-200"
              >
                Delete Event
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-stone-100 text-stone-600 rounded-xl font-light hover:bg-stone-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={categories.length === 0}
                className="px-6 py-2 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {event ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
