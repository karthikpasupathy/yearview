import { init } from '@instantdb/react';

// Visit https://instantdb.com/dash to get your APP_ID
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || 'YOUR_APP_ID';

// Define your data types
export type Category = {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: number;
};

export type Event = {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string (YYYY-MM-DD) - start date
  endDate?: string; // ISO date string (YYYY-MM-DD) - end date (optional)
  categoryId: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  googleEventId?: string;
};

// Initialize InstantDB (without schema for now - schema is managed in InstantDB dashboard)
export const db = init({ appId: APP_ID });
