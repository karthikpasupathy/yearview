'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to trap focus within a modal/dialog for accessibility
 * @param isActive - Whether the focus trap is active
 * @param onEscape - Callback when Escape key is pressed
 */
export function useFocusTrap(isActive: boolean, onEscape?: () => void) {
    const containerRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Store the previously focused element when trap activates
    useEffect(() => {
        if (isActive) {
            previousActiveElement.current = document.activeElement as HTMLElement;

            // Focus the first focusable element in the container
            setTimeout(() => {
                const container = containerRef.current;
                if (container) {
                    const focusableElements = getFocusableElements(container);
                    if (focusableElements.length > 0) {
                        focusableElements[0].focus();
                    }
                }
            }, 0);
        } else {
            // Return focus to the previously focused element
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        }
    }, [isActive]);

    // Handle keyboard navigation within the trap
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isActive) return;

        const container = containerRef.current;
        if (!container) return;

        // Handle Escape key
        if (e.key === 'Escape') {
            e.preventDefault();
            onEscape?.();
            return;
        }

        // Handle Tab key for focus cycling
        if (e.key === 'Tab') {
            const focusableElements = getFocusableElements(container);
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift + Tab: Move backwards
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab: Move forwards
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }, [isActive, onEscape]);

    useEffect(() => {
        if (isActive) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isActive, handleKeyDown]);

    return containerRef;
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
}

/**
 * Hook for keyboard navigation on the calendar grid
 */
export function useCalendarKeyboard(
    year: number,
    onDaySelect: (date: Date) => void,
    onYearChange: (year: number) => void
) {
    const focusedDateRef = useRef<Date>(new Date());

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const target = e.target as HTMLElement;

        // Only handle if we're on a day cell
        if (!target.closest('[data-day-cell]')) return;

        const currentDate = focusedDateRef.current;
        let newDate: Date | null = null;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() + 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() - 7);
                break;
            case 'ArrowDown':
                e.preventDefault();
                newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() + 7);
                break;
            case 'PageUp':
                e.preventDefault();
                newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                break;
            case 'PageDown':
                e.preventDefault();
                newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                break;
            case 'Home':
                e.preventDefault();
                newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                break;
            case 'End':
                e.preventDefault();
                newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                onDaySelect(currentDate);
                return;
        }

        if (newDate) {
            // Check if year changed
            if (newDate.getFullYear() !== year) {
                onYearChange(newDate.getFullYear());
            }

            focusedDateRef.current = newDate;

            // Focus the corresponding day cell
            const dateStr = formatDateForSelector(newDate);
            setTimeout(() => {
                const dayCell = document.querySelector(`[data-date="${dateStr}"]`) as HTMLElement;
                if (dayCell) {
                    dayCell.focus();
                }
            }, 0);
        }
    }, [year, onDaySelect, onYearChange]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const setFocusedDate = useCallback((date: Date) => {
        focusedDateRef.current = date;
    }, []);

    return { setFocusedDate, focusedDate: focusedDateRef };
}

function formatDateForSelector(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
