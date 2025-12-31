'use client';

import AuthWrapper from '@/components/AuthWrapper';
import Header from '@/components/Header';
import YearGrid from '@/components/YearGrid';
import EventModal from '@/components/EventModal';
import CategoryModal from '@/components/CategoryModal';
import DayDetailModal from '@/components/DayDetailModal';
import DisplayOptionsModal from '@/components/DisplayOptionsModal';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import { CalendarSkeleton } from '@/components/Skeleton';
import { ToastProvider } from '@/contexts/ToastContext';
import {
  useCalendarState,
  useCalendarData,
  useVisibleCategoriesInit,
  useGoogleCalendarCategory,
  useSelectedDateEvents
} from '@/hooks/useCalendarState';
import { useCalendarActions } from '@/hooks/useCalendarActions';

function CalendarApp() {
  const state = useCalendarState();
  const { categories, events, isLoading } = useCalendarData(state.selectedYear);

  // Initialize hooks
  useVisibleCategoriesInit(categories, state.visibleCategoryIds, state.setVisibleCategoryIds);
  useGoogleCalendarCategory(categories, state.googleCalendarCategoryId, state.setGoogleCalendarCategoryId);

  const selectedDateEvents = useSelectedDateEvents(state.selectedDate, events);
  const actions = useCalendarActions(state, categories, events);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header
        year={state.selectedYear}
        onYearChange={state.setSelectedYear}
        categories={categories}
        visibleCategoryIds={state.visibleCategoryIds}
        onToggleCategory={actions.handleToggleCategory}
        onAddCategory={actions.handleAddCategory}
        onEditCategory={actions.handleEditCategory}
        onAddEvent={actions.handleAddEvent}
        onOpenDisplayOptions={() => state.setIsDisplayOptionsOpen(true)}

        // Google Calendar Props
        onImportEvents={actions.handleImportGoogleEvents}
        onDeleteGoogleEvents={actions.handleDeleteGoogleEvents}
        googleCalendarCategoryId={state.googleCalendarCategoryId}
        onCreateGoogleCategory={actions.handleCreateGoogleCategory}
      />

      <div className="max-w-[1800px] mx-auto px-2 py-4">
      </div>

      <main className="max-w-[1800px] mx-auto px-2 py-2">
        {isLoading ? (
          <CalendarSkeleton />
        ) : (
          <YearGrid
            year={state.selectedYear}
            events={events}
            categories={categories}
            visibleCategoryIds={state.visibleCategoryIds}
            onDayClick={actions.handleDayClick}
            onEventClick={actions.handleEditEvent}
            showHolidays={state.showHolidays}
            showLongWeekends={state.showLongWeekends}
            showPastDatesAsGray={state.showPastDatesAsGray}
          />
        )}
      </main>

      <EventModal
        isOpen={state.isEventModalOpen}
        onClose={actions.handleCloseEventModal}
        onSave={actions.handleSaveEvent}
        onDelete={actions.handleDeleteEvent}
        event={state.selectedEvent}
        categories={categories}
        selectedDate={state.selectedDate}
      />

      <CategoryModal
        isOpen={state.isCategoryModalOpen}
        onClose={actions.handleCloseCategoryModal}
        onSave={actions.handleSaveCategory}
        onDelete={actions.handleDeleteCategory}
        category={state.selectedCategory}
      />

      <DayDetailModal
        isOpen={state.isDayDetailModalOpen}
        onClose={actions.handleCloseDayDetailModal}
        date={state.selectedDate}
        events={selectedDateEvents}
        categories={categories}
        onEditEvent={actions.handleEditEvent}
        onAddEvent={actions.handleAddEventFromDayDetail}
      />

      <DisplayOptionsModal
        isOpen={state.isDisplayOptionsOpen}
        onClose={() => state.setIsDisplayOptionsOpen(false)}
        showPastDatesAsGray={state.showPastDatesAsGray}
        setShowPastDatesAsGray={state.setShowPastDatesAsGray}
        showHolidays={state.showHolidays}
        setShowHolidays={state.setShowHolidays}
        showLongWeekends={state.showLongWeekends}
        setShowLongWeekends={state.setShowLongWeekends}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthWrapper>
      <ToastProvider>
        <CalendarApp />
      </ToastProvider>
    </AuthWrapper>
  );
}
