# Smart Session Planner

An intelligent session scheduling app that helps users manage and optimize their time with smart suggestions based on availability, session priorities, and spacing patterns.

## Features

- **Smart Suggestions**: AI-powered recommendations for scheduling sessions based on priority, availability, and optimal spacing
- **Session Management**: Create, track, and complete various types of sessions (Deep Work, Workout, Language Practice, etc.)
- **Availability Windows**: Define your available time slots throughout the week
- **Progress Tracking**: View completion rates and statistics across different session types
- **Interactive Dashboard**: Real-time view of today's sessions and upcoming suggestions

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (for mobile development)

### Automated Setup (Recommended)

Run the setup script from the project root:

```bash
./setup.sh
```

This will:
- Check for Node.js installation
- Copy environment variable files
- Install all dependencies
- Set up the database with demo data

Then start the application:

1. **Start the back-end** (in one terminal):
   ```bash
   cd back-end && npm run dev
   ```

2. **Start the front-end** (in another terminal):
   ```bash
   cd front-end && npm start
   ```

3. **Run on your preferred platform**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your physical device

The API will be available at `http://localhost:3001`

### Manual Setup

If you prefer to set up manually:

#### 1. Environment Variables

Copy the example environment files:

```bash
# Back-end
cp back-end/.env.example back-end/.env

# Front-end
cp front-end/.env.example front-end/.env
```

**Back-end (`back-end/.env`)**:
- `DATABASE_URL`: Database connection string (Default: `file:./dev.db`)

**Front-end (`front-end/.env`)**:
- `EXPO_PUBLIC_API_URL`: Back-end API URL (Default: `http://localhost:3001`)

#### 2. Back-end Setup

```bash
cd back-end
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

#### 3. Front-end Setup

In a new terminal:

```bash
cd front-end
npm install
npm start
```

Then press `i` for iOS, `a` for Android, or `w` for web browser

## Assumptions and Limitations

**Static Date for Demo**: The application uses a fixed date (Monday, November 17, 2025) as "today" for demonstration purposes. This allows consistent demo data and suggestions. Real-time date functionality would need to be implemented for production use.

**Suggestion Algorithm**: Suggestions are scored based on session type priority, time since last session of that type, availability window matching, and ideal spacing patterns.

**Single User**: The application currently doesn't support authentication or multiple users. All data is global.

**No Time Zone Handling**: All times are treated as local time without time zone conversion.

**Limited Navigation**: The application is a single-screen demo. Navigation elements are non-functional, including:
- Bottom navigation bar (Calendar, Stats, Settings tabs)
- "View All Suggestions" navigation arrow
- "Add Session" button (+)
- "Manage Types" configuration button
- "Adjust Time" feature on suggestion cards
