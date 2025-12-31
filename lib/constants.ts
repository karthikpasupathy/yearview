/**
 * Application constants - centralized magic strings and configuration
 */

// Category names
export const GOOGLE_CALENDAR_CATEGORY_NAME = 'Google Calendar';
export const GOOGLE_CALENDAR_COLOR = '#4285F4'; // Google blue

// Date formats
export const DATE_FORMAT = 'YYYY-MM-DD';

// UI text
export const UI_TEXT = {
    APP_NAME: 'Annual Calendar',
    APP_TAGLINE: 'Plan your year beautifully',

    // Modal titles
    ADD_EVENT: 'Add Event',
    EDIT_EVENT: 'Edit Event',
    ADD_CATEGORY: 'Add Category',
    EDIT_CATEGORY: 'Edit Category',

    // Button labels
    ADD_EVENT_BUTTON: 'Add Event',
    ADD_CATEGORY_BUTTON: '+ Add Category',
    SIGN_OUT: 'Sign Out',
    TODAY_BUTTON: 'Today',
    GO_TO_TODAY: 'Go to Today',

    // Form labels
    EVENT_TITLE: 'Event Title',
    DESCRIPTION: 'Description',
    START_DATE: 'Start Date',
    END_DATE: 'End Date (Optional)',
    CATEGORY_NAME: 'Category Name',
    COLOR: 'Color',

    // Messages
    NO_EVENTS: 'No events on this day',
    NO_CATEGORIES: 'No categories available',
    DOUBLE_CLICK_TO_EDIT: 'Double-click to edit',

    // Validation
    FILL_REQUIRED_FIELDS: 'Please fill in all required fields',
    END_DATE_AFTER_START: 'End date must be after start date',
    ENTER_CATEGORY_NAME: 'Please enter a category name',

    // Confirmations
    DELETE_EVENT_CONFIRM: 'Are you sure you want to delete this event?',
} as const;

// Sync messages
export const SYNC_MESSAGES = {
    CONNECTING: 'Connecting...',
    SYNCING: 'Syncing...',
    SYNC_SUCCESS: (count: number) => `Imported ${count} events from Google Calendar`,
    SYNC_FAILED: 'Failed to import Google Calendar events',
    CONNECT_GOOGLE: 'Connect Google Calendar',
    DISCONNECT: 'Disconnect',
    SYNC_BUTTON: '↻ Sync Google Calendar',
} as const;
