'use client';

import { Category } from '@/lib/instant';
import { CATEGORY_COLORS } from '@/lib/colors';
import { useState, useEffect } from 'react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: Partial<Category>) => void;
  onDelete?: (categoryId: string) => void;
  category?: Category | null;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  category,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0].value);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
    } else {
      setName('');
      setColor(CATEGORY_COLORS[0].value);
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a category name');
      return;
    }

    onSave({
      id: category?.id,
      name: name.trim(),
      color,
    });

    onClose();
  };

  const handleDelete = () => {
    if (category && onDelete && confirm(`Are you sure you want to delete "${category.name}"? All events in this category will remain but won't be visible until assigned to another category.`)) {
      onDelete(category.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-neutral-200/50 max-w-md w-full mx-4">
        <div className="p-6 border-b border-neutral-200/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-light tracking-tight text-stone-700">
              {category ? 'Edit Category' : 'Add Category'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-light text-stone-600 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-1 focus:ring-neutral-300 focus:border-transparent outline-none transition-all text-stone-700 font-light bg-white/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-light text-stone-600 mb-3">
              Color *
            </label>
            <div className="grid grid-cols-6 gap-3">
              {CATEGORY_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`
                    w-12 h-12 rounded-2xl transition-all transform hover:scale-110
                    ${color === colorOption.value
                      ? 'ring-2 ring-offset-2 scale-110'
                      : 'hover:ring-1 ring-offset-1'
                    }
                  `}
                  style={{
                    backgroundColor: colorOption.value,
                  }}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            {category && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all border border-red-200"
              >
                Delete Category
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-stone-100 text-stone-600 rounded-xl font-light hover:bg-stone-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-stone-800 text-white rounded-xl font-light hover:bg-stone-700 transition-all"
              >
                {category ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
