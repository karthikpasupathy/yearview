# YearView 📅

A beautiful annual calendar app to visualize and organize your entire year. Built with Next.js, InstantDB, and Tailwind CSS.

![YearView Screenshot](https://via.placeholder.com/800x400?text=YearView+Screenshot)

## Features

- 📆 **Full Year View** - See all 365 days at a glance
- 🏷️ **Categories** - Organize events with color-coded categories
- 📅 **Multi-day Events** - Create events that span multiple days
- 🔗 **Google Calendar Sync** - Import events from Google Calendar
- 🔐 **Magic Link Auth** - Passwordless authentication via email
- 📱 **Responsive Design** - Works on desktop and mobile
- ♿ **Accessible** - Keyboard navigation and screen reader support

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/karthikpasupathy/yearview.git
cd yearview
npm install
```

### 2. Set up InstantDB

1. Create a free account at [InstantDB](https://instantdb.com)
2. Create a new app in the dashboard
3. Copy your App ID

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your InstantDB App ID:

```
NEXT_PUBLIC_INSTANT_APP_ID=your_app_id_here
```

### 4. Set up InstantDB permissions

In your InstantDB dashboard, go to **Permissions** and add:

```json
{
  "categories": {
    "allow": {
      "view": "data.userId == auth.id",
      "create": "auth.id != null && data.userId == auth.id",
      "update": "data.userId == auth.id",
      "delete": "data.userId == auth.id"
    }
  },
  "events": {
    "allow": {
      "view": "data.userId == auth.id",
      "create": "auth.id != null && data.userId == auth.id",
      "update": "data.userId == auth.id",
      "delete": "data.userId == auth.id"
    }
  }
}
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your calendar!

## Google Calendar Integration (Optional)

To enable Google Calendar sync:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Add your domain to authorized JavaScript origins
6. Add your `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env.local`

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Database**: [InstantDB](https://instantdb.com) (Real-time sync)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Auth**: InstantDB Magic Link
- **Language**: TypeScript

## Project Structure

```
yearview/
├── app/                # Next.js app router pages
├── components/         # React components
├── contexts/           # React contexts (Toast)
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── public/             # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [InstantDB](https://instantdb.com) for real-time data sync
- Icons from [Heroicons](https://heroicons.com)
- Fonts from [Google Fonts](https://fonts.google.com)
