# Annual Calendar Setup Guide

A beautiful annual calendar application to plan and visualize your entire year with color-coded categories and events.

## Features

✨ **Complete Year View**: See all 365 days of the year in a single, scrollable view
🎨 **Color-Coded Categories**: Create custom categories with beautiful colors
📅 **Event Management**: Add, edit, and delete events with descriptions
🔍 **Category Filtering**: Toggle categories on/off to focus on specific types of events
🔐 **Secure Authentication**: Magic link authentication via InstantDB
☁️ **Real-time Sync**: All data stored and synced in real-time with InstantDB
🎯 **Desktop Optimized**: Clean, minimal, and classy design for desktop use

## Prerequisites

- Node.js 18+ installed
- An InstantDB account (free at https://instantdb.com)

## Setup Instructions

### 1. Get Your InstantDB App ID

1. Go to https://instantdb.com/dash
2. Create a new app or select an existing one
3. Copy your App ID

### 2. Configure Environment Variables

1. Open the `.env.local` file in the root directory
2. Replace `your_app_id_here` with your actual InstantDB App ID:

```
NEXT_PUBLIC_INSTANT_APP_ID=your_actual_app_id_here
```

### 3. Install Dependencies

If you haven't already, install the dependencies:

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Using the Application

### First Time Setup

1. **Sign In**: Enter your email address to receive a magic code
2. **Verify**: Check your email and enter the code to sign in
3. **Create Categories**: Click "+ Add Category" to create your first category (e.g., "Work", "Personal", "Health")
4. **Choose Colors**: Select a color for each category to visually distinguish events

### Adding Events

1. Click the "+ Add Event" button in the header, OR
2. Click on any day in the calendar to open the day detail view
3. Fill in the event details:
   - **Title** (required)
   - **Description** (optional)
   - **Date** (required)
   - **Category** (required - select from your created categories)

### Managing Your View

- **Year Selector**: Use the dropdown next to "Annual Calendar" to switch between years
- **Category Filters**: Click on category badges to show/hide events from that category
- **Today Button**: Click "Today" to jump back to the current date
- **Day Details**: Click any day to see all events for that specific day

### Editing and Deleting

- **Edit Event**: Click on an event in the day detail view to open the edit modal
- **Delete Event**: Open an event for editing and click "Delete Event"

## Technology Stack

- **Frontend**: Next.js 14+ with React 19
- **Styling**: Tailwind CSS 4
- **Backend & Auth**: InstantDB (serverless database with built-in auth)
- **Language**: TypeScript

## Project Structure

```
yearmap/
├── app/
│   ├── page.tsx          # Main calendar page
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles
├── components/
│   ├── AuthWrapper.tsx   # Authentication wrapper
│   ├── Header.tsx        # Top navigation bar
│   ├── YearGrid.tsx      # Annual calendar grid
│   ├── DayCell.tsx       # Individual day cell
│   ├── EventModal.tsx    # Event creation/editing modal
│   ├── CategoryModal.tsx # Category creation/editing modal
│   └── DayDetailModal.tsx # Day detail view modal
├── lib/
│   ├── instant.ts        # InstantDB configuration
│   ├── dateUtils.ts      # Date utility functions
│   └── colors.ts         # Color palette for categories
└── .env.local            # Environment variables (not in git)
```

## InstantDB Schema

The application uses two main entities:

### Categories
- `id`: string (unique identifier)
- `name`: string (category name)
- `color`: string (hex color code)
- `userId`: string (owner's user ID)
- `createdAt`: number (timestamp)

### Events
- `id`: string (unique identifier)
- `title`: string (event title)
- `description`: string (optional description)
- `date`: string (ISO date format YYYY-MM-DD)
- `categoryId`: string (reference to category)
- `userId`: string (owner's user ID)
- `createdAt`: number (timestamp)
- `updatedAt`: number (timestamp)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the `NEXT_PUBLIC_INSTANT_APP_ID` environment variable in Vercel project settings
4. Deploy!

### Deploy to Other Platforms

The application is a standard Next.js app and can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- Your own server with Node.js

## Troubleshooting

### "YOUR_APP_ID" error
- Make sure you've updated `.env.local` with your actual InstantDB App ID
- Restart the development server after changing `.env.local`

### Events not saving
- Verify your InstantDB App ID is correct
- Check the browser console for any errors
- Ensure you're logged in

### Authentication not working
- Check that your email is correct
- Look for the magic code in your spam folder
- Try a different email address

## Support

- InstantDB Documentation: https://docs.instantdb.com
- Next.js Documentation: https://nextjs.org/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs

## License

MIT License - Feel free to use this project for personal or commercial purposes.
