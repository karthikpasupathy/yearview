'use client';

import { useState, useMemo, useEffect } from 'react';
import { db } from '@/lib/instant';
import { formatDate } from '@/lib/dateUtils';
import { v4 as uuidv4 } from 'uuid';
import AuthWrapper from '@/components/AuthWrapper';
import Header from '@/components/Header';
import YearGrid from '@/components/YearGrid';
import EventModal from '@/components/EventModal';
import CategoryModal from '@/components/CategoryModal';
import DayDetailModal from '@/components/DayDetailModal';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import type { Event, Category } from '@/lib/instant';

export default function Home() {
  const { user } = db.useAuth();
  const currentYear = new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [visibleCategoryIds, setVisibleCategoryIds] = useState<Set<string>>(new Set());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [googleCalendarCategoryId, setGoogleCalendarCategoryId] = useState<string | null>(null);

  // Query categories and events
  const { data, isLoading } = db.useQuery(
    user
      ? {
          categories: {},
          events: {},
        }
      : ({} as any)
  );

  const allCategories: Category[] = (data?.categories as Category[]) || [];
  const allEvents: Event[] = (data?.events as Event[]) || [];

  // Filter user's categories
  const categories = allCategories.filter(c => c.userId === user?.id);
  
  // Find or track Google Calendar category
  useEffect(() => {
    if (user) {
      const googleCat = categories.find(c => c.name === 'Google Calendar');
      if (googleCat && googleCat.id !== googleCalendarCategoryId) {
        setGoogleCalendarCategoryId(googleCat.id);
      }
    }
  }, [categories, user, googleCalendarCategoryId]);
  
  // Filter user's events for selected year
  const events = allEvents.filter(e => {
    if (e.userId !== user?.id) return false;
    return e.date >= `${selectedYear}-01-01` && e.date <= `${selectedYear}-12-31`;
  });

  // Initialize visible categories when categories load (exclude Google Calendar by default)
  useEffect(() => {
    if (categories.length > 0 && visibleCategoryIds.size === 0) {
      const nonGoogleCategories = categories.filter(c => c.name !== 'Google Calendar');
      setVisibleCategoryIds(new Set(nonGoogleCategories.map(c => c.id)));
    }
  }, [categories, visibleCategoryIds.size]);

  // Event handlers
  const handleSaveEvent = (eventData: Partial<Event>) => {
    if (!user) return;

    if (eventData.id) {
      // Update existing event
      (db.transact as any)(
        (db.tx as any).events[eventData.id].update({
          title: eventData.title!,
          description: eventData.description,
          date: eventData.date!,
          endDate: eventData.endDate,
          categoryId: eventData.categoryId!,
          updatedAt: Date.now(),
        })
      );
    } else {
      // Create new event
      const newEvent = {
        id: uuidv4(),
        title: eventData.title!,
        description: eventData.description,
        date: eventData.date!,
        endDate: eventData.endDate,
        categoryId: eventData.categoryId!,
        userId: user.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      (db.transact as any)((db.tx as any).events[newEvent.id].update(newEvent));
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    (db.transact as any)((db.tx as any).events[eventId].delete());
  };

  const handleSaveCategory = (categoryData: Partial<Category>) => {
    if (!user) return;

    if (categoryData.id) {
      // Update existing category
      (db.transact as any)(
        (db.tx as any).categories[categoryData.id].update({
          name: categoryData.name!,
          color: categoryData.color!,
        })
      );
    } else {
      // Create new category
      const newCategory = {
        id: uuidv4(),
        name: categoryData.name!,
        color: categoryData.color!,
        userId: user.id,
        createdAt: Date.now(),
      };
      (db.transact as any)((db.tx as any).categories[newCategory.id].update(newCategory));
      setVisibleCategoryIds(prev => new Set([...prev, newCategory.id]));
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    (db.transact as any)((db.tx as any).categories[categoryId].delete());
    setVisibleCategoryIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(categoryId);
      return newSet;
    });
  };

  const handleImportGoogleEvents = (googleEvents: Partial<Event>[], categoryId: string) => {
    if (!user) return;

    // First, delete all existing Google Calendar events
    const existingGoogleEvents = events.filter(e => e.categoryId === categoryId);
    existingGoogleEvents.forEach(event => {
      (db.transact as any)((db.tx as any).events[event.id].delete());
    });

    // Then import new events
    googleEvents.forEach(eventData => {
      const newEvent = {
        id: eventData.id!,
        title: eventData.title!,
        description: eventData.description,
        date: eventData.date!,
        endDate: eventData.endDate,
        categoryId: eventData.categoryId!,
        userId: user.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      (db.transact as any)((db.tx as any).events[newEvent.id].update(newEvent));
    });
  };

  const handleCreateGoogleCategory = (): string => {
    if (!user) return '';
    
    // Check if category already exists
    const existingCat = categories.find(c => c.name === 'Google Calendar');
    if (existingCat) return existingCat.id;
    
    // Create new Google Calendar category
    const newCategory = {
      id: uuidv4(),
      name: 'Google Calendar',
      color: '#4285F4', // Google blue
      userId: user.id,
      createdAt: Date.now(),
    };
    (db.transact as any)((db.tx as any).categories[newCategory.id].update(newCategory));
    setGoogleCalendarCategoryId(newCategory.id);
    // Don't add to visible by default
    return newCategory.id;
  };

  const handleToggleCategory = (categoryId: string) => {
    setVisibleCategoryIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDayDetailModalOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
    setIsDayDetailModalOpen(false);
  };

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = formatDate(selectedDate);
    return events.filter(e => e.date === dateStr);
  }, [selectedDate, events]);

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-neutral-50">
        <Header
          year={selectedYear}
          onYearChange={setSelectedYear}
          categories={categories}
          visibleCategoryIds={visibleCategoryIds}
          onToggleCategory={handleToggleCategory}
          onAddCategory={() => {
            setSelectedCategory(null);
            setIsCategoryModalOpen(true);
          }}
          onEditCategory={(category) => {
            setSelectedCategory(category);
            setIsCategoryModalOpen(true);
          }}
          onAddEvent={handleAddEvent}
        />

        <div className="max-w-[1800px] mx-auto px-2 py-4">
          <div className="mb-4 flex justify-end">
            <GoogleCalendarSync
              year={selectedYear}
              onImportEvents={handleImportGoogleEvents}
              googleCalendarCategoryId={googleCalendarCategoryId}
              onCreateGoogleCategory={handleCreateGoogleCategory}
            />
          </div>
        </div>

        <main className="max-w-[1800px] mx-auto px-2 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-300"></div>
            </div>
          ) : (
            <YearGrid
              year={selectedYear}
              events={events}
              categories={categories}
              visibleCategoryIds={visibleCategoryIds}
              onDayClick={handleDayClick}
              onEventClick={handleEditEvent}
            />
          )}
        </main>

        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          event={selectedEvent}
          categories={categories}
          selectedDate={selectedDate}
        />

        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setSelectedCategory(null);
          }}
          onSave={handleSaveCategory}
          onDelete={handleDeleteCategory}
          category={selectedCategory}
        />

        <DayDetailModal
          isOpen={isDayDetailModalOpen}
          onClose={() => {
            setIsDayDetailModalOpen(false);
            setSelectedDate(null);
          }}
          date={selectedDate}
          events={selectedDateEvents}
          categories={categories}
          onEditEvent={handleEditEvent}
          onAddEvent={() => {
            setIsDayDetailModalOpen(false);
            handleAddEvent();
          }}
        />
      </div>
    </AuthWrapper>
  );
}
