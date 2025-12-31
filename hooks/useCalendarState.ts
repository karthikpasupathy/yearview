'use client';

import { useState, useMemo, useEffect } from 'react';
import { db } from '@/lib/instant';
import type { Event, Category } from '@/lib/instant';
import { GOOGLE_CALENDAR_CATEGORY_NAME } from '@/lib/constants';

export interface CalendarState {
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    visibleCategoryIds: Set<string>;
    setVisibleCategoryIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    isEventModalOpen: boolean;
    setIsEventModalOpen: (open: boolean) => void;
    isCategoryModalOpen: boolean;
    setIsCategoryModalOpen: (open: boolean) => void;
    isDayDetailModalOpen: boolean;
    setIsDayDetailModalOpen: (open: boolean) => void;
    isDisplayOptionsOpen: boolean;
    setIsDisplayOptionsOpen: (open: boolean) => void;
    selectedEvent: Event | null;
    setSelectedEvent: (event: Event | null) => void;
    selectedCategory: Category | null;
    setSelectedCategory: (category: Category | null) => void;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
    googleCalendarCategoryId: string | null;
    setGoogleCalendarCategoryId: (id: string | null) => void;
    // Display options
    showPastDatesAsGray: boolean;
    setShowPastDatesAsGray: (show: boolean) => void;
    showHolidays: boolean;
    setShowHolidays: (show: boolean) => void;
    showLongWeekends: boolean;
    setShowLongWeekends: (show: boolean) => void;
}

export interface CalendarData {
    categories: Category[];
    events: Event[];
    allEvents: Event[];
    isLoading: boolean;
}

export function useCalendarState(): CalendarState {
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [visibleCategoryIds, setVisibleCategoryIds] = useState<Set<string>>(new Set());
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
    const [isDisplayOptionsOpen, setIsDisplayOptionsOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [googleCalendarCategoryId, setGoogleCalendarCategoryId] = useState<string | null>(null);

    // Display options state
    const [showPastDatesAsGray, setShowPastDatesAsGray] = useState(true);
    const [showHolidays, setShowHolidays] = useState(true);
    const [showLongWeekends, setShowLongWeekends] = useState(true);

    return {
        selectedYear,
        setSelectedYear,
        visibleCategoryIds,
        setVisibleCategoryIds,
        isEventModalOpen,
        setIsEventModalOpen,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        isDayDetailModalOpen,
        setIsDayDetailModalOpen,
        isDisplayOptionsOpen,
        setIsDisplayOptionsOpen,
        selectedEvent,
        setSelectedEvent,
        selectedCategory,
        setSelectedCategory,
        selectedDate,
        setSelectedDate,
        googleCalendarCategoryId,
        setGoogleCalendarCategoryId,
        // Display options
        showPastDatesAsGray,
        setShowPastDatesAsGray,
        showHolidays,
        setShowHolidays,
        showLongWeekends,
        setShowLongWeekends,
    };
}

export function useCalendarData(selectedYear: number): CalendarData {
    const { user } = db.useAuth();

    // Server-side filtering using InstantDB where clause
    // This ensures only the user's data is fetched, improving security
    const { data, isLoading } = db.useQuery(
        user
            ? {
                categories: {
                    $: {
                        where: {
                            userId: user.id,
                        },
                    },
                },
                events: {
                    $: {
                        where: {
                            userId: user.id,
                        },
                    },
                },
            }
            : ({} as any)
    );

    const categories: Category[] = (data?.categories as Category[]) || [];
    const allEvents: Event[] = (data?.events as Event[]) || [];

    // Filter events for selected year (still needed for year filtering)
    const events = useMemo(() =>
        allEvents.filter(e =>
            e.date >= `${selectedYear}-01-01` && e.date <= `${selectedYear}-12-31`
        ),
        [allEvents, selectedYear]
    );

    return {
        categories,
        events,
        allEvents,
        isLoading,
    };
}

export function useVisibleCategoriesInit(
    categories: Category[],
    visibleCategoryIds: Set<string>,
    setVisibleCategoryIds: React.Dispatch<React.SetStateAction<Set<string>>>
) {
    // Initialize visible categories when categories load (exclude Google Calendar by default)
    useEffect(() => {
        if (categories.length > 0 && visibleCategoryIds.size === 0) {
            const nonGoogleCategories = categories.filter(c => c.name !== GOOGLE_CALENDAR_CATEGORY_NAME);
            setVisibleCategoryIds(new Set(nonGoogleCategories.map(c => c.id)));
        }
    }, [categories, visibleCategoryIds.size, setVisibleCategoryIds]);
}

export function useGoogleCalendarCategory(
    categories: Category[],
    googleCalendarCategoryId: string | null,
    setGoogleCalendarCategoryId: (id: string | null) => void
) {
    const { user } = db.useAuth();

    useEffect(() => {
        if (user) {
            const googleCat = categories.find(c => c.name === 'Google Calendar');
            if (googleCat && googleCat.id !== googleCalendarCategoryId) {
                setGoogleCalendarCategoryId(googleCat.id);
            }
        }
    }, [categories, user, googleCalendarCategoryId, setGoogleCalendarCategoryId]);
}

export function useSelectedDateEvents(
    selectedDate: Date | null,
    events: Event[]
): Event[] {
    return useMemo(() => {
        if (!selectedDate) return [];
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Include events where the selected date falls within the event's date range
        return events.filter(e => {
            const eventStart = e.date;
            const eventEnd = e.endDate || e.date;
            return dateStr >= eventStart && dateStr <= eventEnd;
        });
    }, [selectedDate, events]);
}
