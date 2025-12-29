export const CATEGORY_COLORS = [
  { name: 'Green', value: '#10b981', light: '#a7f3d0' },
  { name: 'Emerald', value: '#059669', light: '#6ee7b7' },
  { name: 'Teal', value: '#14b8a6', light: '#5eead4' },
  { name: 'Cyan', value: '#06b6d4', light: '#67e8f9' },
  { name: 'Sky', value: '#0ea5e9', light: '#7dd3fc' },
  { name: 'Blue', value: '#3b82f6', light: '#93c5fd' },
  { name: 'Indigo', value: '#6366f1', light: '#a5b4fc' },
  { name: 'Violet', value: '#8b5cf6', light: '#c4b5fd' },
  { name: 'Purple', value: '#a855f7', light: '#d8b4fe' },
  { name: 'Fuchsia', value: '#d946ef', light: '#f0abfc' },
  { name: 'Pink', value: '#ec4899', light: '#f9a8d4' },
  { name: 'Rose', value: '#f43f5e', light: '#fda4af' },
  { name: 'Red', value: '#ef4444', light: '#fca5a5' },
  { name: 'Orange', value: '#f97316', light: '#fdba74' },
  { name: 'Amber', value: '#f59e0b', light: '#fcd34d' },
  { name: 'Yellow', value: '#eab308', light: '#fde047' },
  { name: 'Lime', value: '#84cc16', light: '#bef264' },
  { name: 'Slate', value: '#64748b', light: '#cbd5e1' },
] as const;

export type CategoryColor = typeof CATEGORY_COLORS[number];

export function getColorByValue(value: string): CategoryColor | undefined {
  return CATEGORY_COLORS.find(color => color.value === value);
}
