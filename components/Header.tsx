'use client';

import { Category } from '@/lib/instant';
import { db } from '@/lib/instant';

interface HeaderProps {
  year: number;
  onYearChange: (year: number) => void;
  categories: Category[];
  visibleCategoryIds: Set<string>;
  onToggleCategory: (categoryId: string) => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onAddEvent: () => void;
}

export default function Header({
  year,
  onYearChange,
  categories,
  visibleCategoryIds,
  onToggleCategory,
  onAddCategory,
  onEditCategory,
  onAddEvent,
}: HeaderProps) {
  const { user } = db.useAuth();
  
  const handleSignOut = () => {
    db.auth.signOut();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-300">
      <div className="max-w-[1800px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-normal tracking-tight text-neutral-900">
                Annual Calendar
              </h1>
            </div>

            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="px-4 py-2 rounded-xl border border-neutral-300 bg-white text-neutral-900 font-normal hover:border-neutral-400 focus:ring-2 focus:ring-neutral-400 focus:border-transparent outline-none transition-all cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onAddEvent}
              className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-all flex items-center space-x-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Event</span>
            </button>

            <div className="flex items-center space-x-2 text-sm text-neutral-700">
              <span>{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-wrap">
            <span className="text-sm font-medium text-neutral-700">Categories:</span>
            
            {categories.map((category) => {
              const isVisible = visibleCategoryIds.has(category.id);
              return (
                <div key={category.id} className="relative group">
                  <button
                    onClick={() => onToggleCategory(category.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      onEditCategory(category);
                    }}
                    onDoubleClick={() => onEditCategory(category)}
                    className={`
                      px-3 py-1.5 rounded-full font-medium text-sm transition-all
                      ${isVisible
                        ? 'opacity-100 shadow-sm'
                        : 'opacity-40 hover:opacity-60'
                      }
                    `}
                    style={{
                      backgroundColor: isVisible ? category.color + '40' : category.color + '20',
                      color: isVisible ? category.color : category.color + '90',
                      border: `2px solid ${isVisible ? category.color : 'transparent'}`,
                    }}
                  >
                    <span className="flex items-center space-x-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></span>
                      <span>{category.name}</span>
                    </span>
                  </button>
                  
                  {/* Edit hint on hover */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Double-click to edit
                  </div>
                </div>
              );
            })}

            <button
              onClick={onAddCategory}
              className="px-3 py-1.5 border-2 border-dashed border-neutral-400 text-neutral-700 rounded-full font-medium text-sm hover:border-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all"
            >
              + Add Category
            </button>
          </div>

          <button
            onClick={() => {
              const today = new Date();
              onYearChange(today.getFullYear());
              setTimeout(() => {
                const todayElement = document.querySelector('[class*="ring-neutral"]');
                todayElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 100);
            }}
            className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-xl font-medium hover:bg-neutral-300 transition-all text-sm"
          >
            Today ({currentYear})
          </button>
        </div>
      </div>
    </header>
  );
}
