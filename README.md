# Smart Session Planner

An intelligent session scheduling app that helps users manage and optimize their time with smart suggestions based on availability, session priorities, and spacing patterns.

## Features

- **Smart Suggestions**: AI-powered recommendations for scheduling sessions based on priority, availability, and optimal spacing
- **Session Management**: Create, track, and complete various types of sessions (Deep Work, Workout, Language Practice, etc.)
- **Availability Windows**: Define your available time slots throughout the week
- **Progress Tracking**: View completion rates and statistics across different session types
- **Interactive Dashboard**: Real-time view of today's sessions and upcoming suggestions

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (for mobile development)

### Front-end Setup

1. From the root directory, navigate to the front-end:
   ```bash
   cd front-end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

4. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your physical device

### Back-end Setup

1. From the root directory, navigate to the back-end:
   ```bash
   cd back-end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

4. Push the database schema:
   ```bash
   npm run db:push
   ```

5. Seed the database with demo data:
   ```bash
   npm run db:seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3001`

## Environment Variables

### Back-end (`back-end/.env`)

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

- `DATABASE_URL`: Database connection string
  - Default: `file:./dev.db` (SQLite for local development)

### Front-end (`front-end/.env`)

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

- `EXPO_PUBLIC_API_URL`: Back-end API URL
  - Default: `http://localhost:3001`

## Assumptions and Limitations

**Static Date for Demo**: The application uses a fixed date (Monday, November 17, 2025) as "today" for demonstration purposes. This allows consistent demo data and suggestions. Real-time date functionality would need to be implemented for production use.

**Suggestion Algorithm**: Suggestions are scored based on session type priority, time since last session of that type, availability window matching, and ideal spacing patterns.

**Single User**: The application currently doesn't support authentication or multiple users. All data is global.

**No Time Zone Handling**: All times are treated as local time without time zone conversion.
