'use client';

import { useEffect, useRef } from 'react';

interface DisplayOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showPastDatesAsGray: boolean;
    setShowPastDatesAsGray: (show: boolean) => void;
    showHolidays: boolean;
    setShowHolidays: (show: boolean) => void;
    showLongWeekends: boolean;
    setShowLongWeekends: (show: boolean) => void;
}

export default function DisplayOptionsModal({
    isOpen,
    onClose,
    showPastDatesAsGray,
    setShowPastDatesAsGray,
    showHolidays,
    setShowHolidays,
    showLongWeekends,
    setShowLongWeekends,
}: DisplayOptionsModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="display-options-title"
        >
            <div
                ref={modalRef}
                className="bg-white/95 backdrop-blur-md rounded-3xl border border-neutral-200/50 max-w-sm w-full mx-4"
            >
                {/* Header */}
                <div className="p-6 border-b border-neutral-200/50">
                    <div className="flex items-center justify-between">
                        <h2 id="display-options-title" className="text-2xl font-light tracking-tight text-stone-700">
                            Display
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-stone-400 hover:text-stone-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Past Dates Toggle */}
                    <label className="flex items-center justify-between cursor-pointer group">
                        <div>
                            <span className="text-stone-700 font-light">Dim past dates</span>
                            <p className="text-xs text-stone-400 font-light mt-0.5">Reduce opacity of past dates</p>
                        </div>
                        <button
                            onClick={() => setShowPastDatesAsGray(!showPastDatesAsGray)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${showPastDatesAsGray ? 'bg-stone-800' : 'bg-stone-200'
                                }`}
                        >
                            <div
                                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                                style={{ left: showPastDatesAsGray ? 'auto' : '2px', right: showPastDatesAsGray ? '2px' : 'auto' }}
                            />
                        </button>
                    </label>

                    <div className="border-t border-neutral-100 pt-4">
                        <p className="text-xs text-stone-400 font-light uppercase tracking-wider mb-3">Show on calendar</p>

                        {/* Holidays Toggle */}
                        <label className="flex items-center justify-between cursor-pointer py-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                                <span className="text-stone-700 font-light">Holidays</span>
                            </div>
                            <button
                                onClick={() => setShowHolidays(!showHolidays)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${showHolidays ? 'bg-stone-800' : 'bg-stone-200'
                                    }`}
                            >
                                <div
                                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                                    style={{ left: showHolidays ? 'auto' : '2px', right: showHolidays ? '2px' : 'auto' }}
                                />
                            </button>
                        </label>

                        {/* Long Weekends Toggle */}
                        <label className="flex items-center justify-between cursor-pointer py-2">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-sm bg-red-200"></div>
                                <span className="text-stone-700 font-light">Long weekends</span>
                            </div>
                            <button
                                onClick={() => setShowLongWeekends(!showLongWeekends)}
                                className={`relative w-11 h-6 rounded-full transition-colors ${showLongWeekends ? 'bg-stone-800' : 'bg-stone-200'
                                    }`}
                            >
                                <div
                                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all"
                                    style={{ left: showLongWeekends ? 'auto' : '2px', right: showLongWeekends ? '2px' : 'auto' }}
                                />
                            </button>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-stone-800 text-white rounded-xl font-light hover:bg-stone-700 transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
