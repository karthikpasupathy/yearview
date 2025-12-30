'use client';

import { useState, useEffect } from 'react';
import { googleCalendarService, GoogleCalendarEvent } from '@/lib/googleCalendar';
import { Event } from '@/lib/instant';
import { v4 as uuidv4 } from 'uuid';

interface GoogleCalendarSyncProps {
  year: number;
  onImportEvents: (events: Partial<Event>[], categoryId: string) => void;
  googleCalendarCategoryId: string | null;
  onCreateGoogleCategory: () => string;
}

export default function GoogleCalendarSync({ 
  year, 
  onImportEvents,
  googleCalendarCategoryId,
  onCreateGoogleCategory
}: GoogleCalendarSyncProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    googleCalendarService.init().then(() => {
      setIsSignedIn(googleCalendarService.isSignedIn());
    });
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    const success = await googleCalendarService.signIn();
    setIsSignedIn(success);
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await googleCalendarService.signOut();
    setIsSignedIn(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Create or get the Google Calendar category
      const categoryId = googleCalendarCategoryId || onCreateGoogleCategory();
      
      const googleEvents = await googleCalendarService.fetchEvents(year);
      
      const convertedEvents: Partial<Event>[] = googleEvents.map((gEvent: GoogleCalendarEvent) => {
        const startDate = gEvent.start.date || gEvent.start.dateTime?.split('T')[0] || '';
        const endDate = gEvent.end.date || gEvent.end.dateTime?.split('T')[0] || '';
        
        return {
          id: uuidv4(),
          title: gEvent.summary || 'Untitled Event',
          description: gEvent.description || `Imported from Google Calendar`,
          date: startDate,
          endDate: endDate !== startDate ? endDate : undefined,
          categoryId: categoryId,
        };
      });

      onImportEvents(convertedEvents, categoryId);
      alert(`Successfully imported ${convertedEvents.length} events from Google Calendar`);
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync with Google Calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!isSignedIn ? (
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="px-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <span>Connecting...</span>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Connect Google Calendar
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : '↻ Sync Google Calendar'}
          </button>
          <button
            onClick={handleSignOut}
            className="px-3 py-2 bg-neutral-100 text-neutral-600 rounded-xl text-sm hover:bg-neutral-200 transition-all"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
