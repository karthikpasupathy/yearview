'use client';

import { useCallback } from 'react';
import { db } from '@/lib/instant';
import { v4 as uuidv4 } from 'uuid';
import type { Event, Category, CustomHoliday } from '@/lib/instant';
import { useToast } from '@/contexts/ToastContext';
import type { CalendarState } from './useCalendarState';
import { GOOGLE_CALENDAR_CATEGORY_NAME, GOOGLE_CALENDAR_COLOR } from '@/lib/constants';

export function useCalendarActions(
    state: CalendarState,
    categories: Category[],
    events: Event[]
) {
    const { user } = db.useAuth();
    const { showToast, showConfirm } = useToast();

    const handleSaveEvent = useCallback((eventData: Partial<Event>) => {
        if (!user) return;

        try {
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
                showToast('Event updated successfully', 'success');
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
                showToast('Event created successfully', 'success');
            }
        } catch (error) {
            showToast('Failed to save event', 'error');
            console.error('Error saving event:', error);
        }
    }, [user, showToast]);

    const handleDeleteEvent = useCallback((eventId: string) => {
        try {
            (db.transact as any)((db.tx as any).events[eventId].delete());
            showToast('Event deleted', 'info');
        } catch (error) {
            showToast('Failed to delete event', 'error');
            console.error('Error deleting event:', error);
        }
    }, [showToast]);

    const handleSaveCategory = useCallback((categoryData: Partial<Category>) => {
        if (!user) return;

        try {
            if (categoryData.id) {
                // Update existing category
                (db.transact as any)(
                    (db.tx as any).categories[categoryData.id].update({
                        name: categoryData.name!,
                        color: categoryData.color!,
                    })
                );
                showToast('Category updated successfully', 'success');
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
                state.setVisibleCategoryIds(prev => new Set([...prev, newCategory.id]));
                showToast('Category created successfully', 'success');
            }
        } catch (error) {
            showToast('Failed to save category', 'error');
            console.error('Error saving category:', error);
        }
    }, [user, state, showToast]);

    const handleDeleteCategory = useCallback((categoryId: string) => {
        // Find events that belong to this category
        const categoryEvents = events.filter(e => e.categoryId === categoryId);
        const eventCount = categoryEvents.length;

        const message = eventCount > 0
            ? `This will delete the category and ${eventCount} event${eventCount > 1 ? 's' : ''} in it. Continue?`
            : 'Are you sure you want to delete this category?';

        showConfirm(message, () => {
            try {
                // Delete all events in this category first
                categoryEvents.forEach(event => {
                    (db.transact as any)((db.tx as any).events[event.id].delete());
                });

                // Then delete the category
                (db.transact as any)((db.tx as any).categories[categoryId].delete());

                state.setVisibleCategoryIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(categoryId);
                    return newSet;
                });

                const successMsg = eventCount > 0
                    ? `Category and ${eventCount} event${eventCount > 1 ? 's' : ''} deleted`
                    : 'Category deleted';
                showToast(successMsg, 'info');
            } catch (error) {
                showToast('Failed to delete category', 'error');
                console.error('Error deleting category:', error);
            }
        });
    }, [events, state, showToast, showConfirm]);

    const handleImportGoogleEvents = useCallback((googleEvents: Partial<Event>[], categoryId: string) => {
        if (!user) return;

        try {
            let addedCount = 0;
            let linkedCount = 0;

            googleEvents.forEach(eventData => {
                if (!eventData.googleEventId) return;

                // 1. Check if event already exists by googleEventId
                const existingByGoogleId = events.find(e => e.googleEventId === eventData.googleEventId);

                if (existingByGoogleId) {
                    // Event already exists and is linked. 
                    // We skip it as per "Existing events shouldn't be fetched again"
                    return;
                }

                // 2. Check for legacy match (same category, title, dates, but NO googleEventId)
                // This prevents duplicating events imported before we started tracking googleEventId
                const legacyMatch = events.find(e =>
                    e.categoryId === categoryId &&
                    !e.googleEventId &&
                    e.title === eventData.title &&
                    e.date === eventData.date &&
                    e.endDate === eventData.endDate
                );

                if (legacyMatch) {
                    // Link the legacy event to this Google event
                    (db.transact as any)((db.tx as any).events[legacyMatch.id].update({
                        googleEventId: eventData.googleEventId,
                        updatedAt: Date.now(),
                        // We could update other fields here if we wanted to enforce sync,
                        // but sticking to "only new" preference, we'll minimal touch.
                    }));
                    linkedCount++;
                    return;
                }

                // 3. Create new event
                // eventData.id was generated by uuidv4() in the caller
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
                    googleEventId: eventData.googleEventId,
                };
                (db.transact as any)((db.tx as any).events[newEvent.id].update(newEvent));
                addedCount++;
            });

            if (addedCount > 0 || linkedCount > 0) {
                showToast(`Synced: ${addedCount} new, ${linkedCount} linked.`, 'success');
            } else {
                showToast('No new events to sync.', 'info');
            }
        } catch (error) {
            showToast('Failed to import Google Calendar events', 'error');
            console.error('Error importing events:', error);
        }
    }, [user, events, showToast]);

    const handleCreateGoogleCategory = useCallback((): string => {
        if (!user) return '';

        // Check if category already exists
        const existingCat = categories.find(c => c.name === GOOGLE_CALENDAR_CATEGORY_NAME);
        if (existingCat) return existingCat.id;

        // Create new Google Calendar category
        const newCategory = {
            id: uuidv4(),
            name: GOOGLE_CALENDAR_CATEGORY_NAME,
            color: GOOGLE_CALENDAR_COLOR,
            userId: user.id,
            createdAt: Date.now(),
        };
        (db.transact as any)((db.tx as any).categories[newCategory.id].update(newCategory));
        state.setGoogleCalendarCategoryId(newCategory.id);
        // Don't add to visible by default
        return newCategory.id;
    }, [user, categories, state]);

    const handleToggleCategory = useCallback((categoryId: string) => {
        state.setVisibleCategoryIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    }, [state]);

    const handleDayClick = useCallback((date: Date) => {
        state.setSelectedDate(date);
        state.setIsDayDetailModalOpen(true);
    }, [state]);

    const handleAddEvent = useCallback(() => {
        state.setSelectedEvent(null);
        state.setIsEventModalOpen(true);
    }, [state]);

    const handleEditEvent = useCallback((event: Event) => {
        state.setSelectedEvent(event);
        state.setIsEventModalOpen(true);
        state.setIsDayDetailModalOpen(false);
    }, [state]);

    const handleAddCategory = useCallback(() => {
        state.setSelectedCategory(null);
        state.setIsCategoryModalOpen(true);
    }, [state]);

    const handleEditCategory = useCallback((category: Category) => {
        state.setSelectedCategory(category);
        state.setIsCategoryModalOpen(true);
    }, [state]);

    const handleCloseEventModal = useCallback(() => {
        state.setIsEventModalOpen(false);
        state.setSelectedEvent(null);
    }, [state]);

    const handleCloseCategoryModal = useCallback(() => {
        state.setIsCategoryModalOpen(false);
        state.setSelectedCategory(null);
    }, [state]);

    const handleCloseDayDetailModal = useCallback(() => {
        state.setIsDayDetailModalOpen(false);
        state.setSelectedDate(null);
    }, [state]);

    const handleDeleteGoogleEvents = useCallback((categoryId: string) => {
        try {
            // Delete all events in the Google Calendar category
            const googleEvents = events.filter(e => e.categoryId === categoryId);
            googleEvents.forEach(event => {
                (db.transact as any)((db.tx as any).events[event.id].delete());
            });

            // Also hide the category
            state.setVisibleCategoryIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(categoryId);
                return newSet;
            });
        } catch (error) {
            console.error('Error deleting Google Calendar events:', error);
        }
    }, [events, state]);

    const handleSaveCustomHoliday = useCallback((holidayData: Partial<CustomHoliday>) => {
        if (!user) return;

        try {
            if (holidayData.id) {
                // Update existing holiday
                (db.transact as any)(
                    (db.tx as any).customHolidays[holidayData.id].update({
                        date: holidayData.date!,
                        note: holidayData.note!,
                    })
                );
                showToast('Holiday updated', 'success');
            } else {
                // Create new holiday
                const newHoliday = {
                    id: uuidv4(),
                    date: holidayData.date!,
                    note: holidayData.note!,
                    userId: user.id,
                    createdAt: Date.now(),
                };
                (db.transact as any)((db.tx as any).customHolidays[newHoliday.id].update(newHoliday));
                showToast('Holiday marked', 'success');
            }
        } catch (error) {
            showToast('Failed to save holiday', 'error');
            console.error('Error saving holiday:', error);
        }
    }, [user, showToast]);

    const handleDeleteCustomHoliday = useCallback((holidayId: string) => {
        try {
            (db.transact as any)((db.tx as any).customHolidays[holidayId].delete());
            showToast('Holiday removed', 'info');
        } catch (error) {
            showToast('Failed to remove holiday', 'error');
            console.error('Error removing holiday:', error);
        }
    }, [showToast]);

    const handleAddEventFromDayDetail = useCallback(() => {
        state.setIsDayDetailModalOpen(false);
        state.setSelectedEvent(null);
        state.setIsEventModalOpen(true);
    }, [state]);

    return {
        handleSaveEvent,
        handleDeleteEvent,
        handleSaveCategory,
        handleDeleteCategory,
        handleImportGoogleEvents,
        handleCreateGoogleCategory,
        handleDeleteGoogleEvents,
        handleToggleCategory,
        handleDayClick,
        handleAddEvent,
        handleEditEvent,
        handleAddCategory,
        handleEditCategory,
        handleCloseEventModal,
        handleCloseCategoryModal,
        handleCloseDayDetailModal,
        handleAddEventFromDayDetail,
        handleSaveCustomHoliday,
        handleDeleteCustomHoliday,
    };
}
