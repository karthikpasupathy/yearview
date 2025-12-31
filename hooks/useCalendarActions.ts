'use client';

import { useCallback } from 'react';
import { db } from '@/lib/instant';
import { v4 as uuidv4 } from 'uuid';
import type { Event, Category } from '@/lib/instant';
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

            showToast(`Imported ${googleEvents.length} events from Google Calendar`, 'success');
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
    };
}
