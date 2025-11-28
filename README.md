# Smart Session Planner

An end-to-end mobile application for intelligent session scheduling with AI-powered suggestions. Built with Expo (React Native) for the client and Next.js for the backend API.

## Project Structure

```
smart-session-planner/
├── front-end/          # Expo/React Native mobile app
│   ├── app/           # App screens and navigation
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── screens/     # Main app screens
│   │   ├── api/         # API client & mock data
│   │   ├── assets/      # Images, icons, fonts
│   │   └── theme.ts     # Design system
│   └── package.json
│
└── back-end/          # Next.js API server
    ├── app/
    │   └── api/       # API routes
    ├── lib/           # Utilities (Prisma client, etc.)
    ├── prisma/        # Database schema and migrations
    │   └── schema.prisma
    └── package.json
```

## Tech Stack

### Front-end
- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **UI:** Custom components with theme system
- **State:** React hooks

### Back-end
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (via Prisma ORM)
- **Port:** 3001

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd smart-session-planner
   ```

### Back-end Setup

1. **Navigate to back-end:**
   ```bash
   cd back-end
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. **Initialize the database:**
   ```bash
   npm run db:push
   ```

5. **Start the API server:**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3001`

### Front-end Setup

1. **Navigate to front-end:**
   ```bash
   cd front-end
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Expo app:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Core Features

### ✅ 1. Session Types
- Create/edit/delete session types
- Fields: name, category/tag, priority (1–5)
- Track count of completed sessions per type
- **API:** Full CRUD operations at `/api/session-types`

### ✅ 2. User Availability
- Define weekly availability windows (e.g., Mon: 9–12am, Wed: 2–5pm)
- Add, view, and delete availability windows
- **API:** Full CRUD operations at `/api/availability`
- **UI:** Modal interface accessible from dashboard "Available" card

### ✅ 3. Scheduling & Smart Suggestions
- Create, view, update, and delete scheduled sessions
- Smart time slot suggestions powered by sophisticated algorithm
- **Suggestion Algorithm considers:**
  - **User Availability**: Only suggests times within defined windows
  - **Existing Sessions**: Avoids conflicts automatically
  - **Priority**: High-priority sessions get better time slots (morning)
  - **Recency**: Boosts sessions that haven't been scheduled recently
  - **Spacing Consistency**: Maintains historical patterns
  - **Daily Load**: Prevents clustering too many sessions in one day
  - **Time of Day**: Matches session priority to optimal times
  - **Buffer Time**: Prefers slots with breathing room
- **Conflict Detection**: Clearly surfaces overlapping sessions with 409 status
- **API:** Full CRUD at `/api/sessions`, suggestions at `/api/suggestions`
- **UI:** Dashboard shows smart suggestions with accept/adjust buttons

### 🚧 4. Progress Summary (Planned)
- Overall statistics dashboard
- Breakdown by session type
- Derived metrics (streaks, spacing, etc.)

## API Documentation

### Session Types Endpoints

#### GET /api/session-types
List all session types with completed counts.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Deep Work",
    "category": "Focus",
    "priority": 5,
    "completedCount": 12,
    "createdAt": "2024-11-27T...",
    "updatedAt": "2024-11-27T..."
  }
]
```

#### POST /api/session-types
Create a new session type.

**Request:**
```json
{
  "name": "Deep Work",
  "category": "Focus",
  "priority": 5
}
```

**Validation:**
- `name`: string (required)
- `category`: string (required)
- `priority`: number 1-5 (required)

#### PUT /api/session-types/[id]
Update a session type (all fields optional).

#### DELETE /api/session-types/[id]
Delete a session type (cascades to sessions).

### Availability Endpoints

#### GET /api/availability
List all availability windows ordered by day and time.

**Response:**
```json
[
  {
    "id": "uuid",
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "12:00",
    "createdAt": "2024-11-27T...",
    "updatedAt": "2024-11-27T..."
  }
]
```

#### POST /api/availability
Create a new availability window.

**Request:**
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "12:00"
}
```

**Validation:**
- `dayOfWeek`: number 0-6 (0=Sunday, 6=Saturday) (required)
- `startTime`: string in HH:MM format (required)
- `endTime`: string in HH:MM format (required)
- `startTime` must be before `endTime`

#### PUT /api/availability/[id]
Update an availability window (all fields optional).

#### DELETE /api/availability/[id]
Delete an availability window.

### Session Endpoints

#### GET /api/sessions
List all sessions with optional filtering.

**Query Parameters:**
- `upcoming` (boolean): Filter for upcoming, non-completed sessions
- `startDate` (ISO 8601): Filter sessions after this date
- `endDate` (ISO 8601): Filter sessions before this date

**Response:**
```json
[
  {
    "id": "uuid",
    "sessionTypeId": "uuid",
    "sessionType": {
      "id": "uuid",
      "name": "Deep Work",
      "category": "Focus",
      "priority": 5
    },
    "scheduledAt": "2024-12-01T09:00:00.000Z",
    "duration": 60,
    "completed": false,
    "createdAt": "2024-11-27T...",
    "updatedAt": "2024-11-27T..."
  }
]
```

#### POST /api/sessions
Create a new session.

**Request:**
```json
{
  "sessionTypeId": "uuid",
  "scheduledAt": "2024-12-01T09:00:00.000Z",
  "duration": 60,
  "checkConflict": true
}
```

**Validation:**
- `sessionTypeId`: valid session type UUID (required)
- `scheduledAt`: ISO 8601 date string (required)
- `duration`: positive number in minutes (required)
- `checkConflict`: boolean (optional, default: true)

**Conflict Response (409):**
```json
{
  "error": "Session conflicts with existing sessions",
  "conflicts": [
    {
      "id": "uuid",
      "sessionType": "Deep Work",
      "scheduledAt": "2024-12-01T09:00:00.000Z",
      "duration": 60
    }
  ]
}
```

#### PUT /api/sessions/[id]
Update a session (mark as completed, reschedule, or change duration).

#### DELETE /api/sessions/[id]
Delete a session.

### Suggestion Endpoints

#### GET /api/suggestions
Generate smart time slot suggestions for a session type.

**Query Parameters:**
- `sessionTypeId` (required): UUID of session type
- `duration` (optional): Session duration in minutes (default: 60)
- `daysAhead` (optional): How many days to look ahead (default: 7)
- `limit` (optional): Max number of suggestions (default: 5)

**Response:**
```json
{
  "suggestions": [
    {
      "rank": 1,
      "sessionType": {
        "id": "uuid",
        "name": "Deep Work",
        "category": "Focus",
        "priority": 5
      },
      "suggestedStart": "2024-12-01T09:00:00.000Z",
      "suggestedEnd": "2024-12-01T10:00:00.000Z",
      "duration": 60,
      "score": 184,
      "reasons": [
        "High priority (5/5) session type",
        "Good spacing (2.3 days since last Deep Work)",
        "No other sessions scheduled this day",
        "Morning time slot (ideal for high-priority work)"
      ]
    }
  ],
  "sessionTypeStats": {
    "name": "Deep Work",
    "priority": 5,
    "upcomingCount": 2,
    "completedCount": 5,
    "averageSpacingDays": 2.1
  }
}
```

**Algorithm Details:**
Suggestions are scored based on multiple weighted factors:
1. **Priority** (20 pts/level): Higher priority = better slots
2. **Recency** (up to 50 pts): Boost for sessions not scheduled recently
3. **Spacing Consistency** (up to 30 pts): Matches historical patterns
4. **Daily Load** (-15 pts/session): Penalizes overcrowded days
5. **Priority Load** (-5 pts/priority): Prevents high-stress days
6. **Time of Day** (10 pts): Morning for high-priority, afternoon for low
7. **Urgency** (up to 40 pts): Sooner is generally better
8. **Buffer Time** (15 pts): Bonus for breathing room

#### POST /api/suggestions/accept
Accept a suggestion and create a session from it.

**Request:**
```json
{
  "sessionTypeId": "uuid",
  "scheduledAt": "2024-12-01T09:00:00.000Z",
  "duration": 60
}
```

### Error Responses

All endpoints return standard HTTP codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error format:
```json
{
  "error": "Error message"
}
```

## Database Schema

### SessionType
```prisma
model SessionType {
  id        String   @id @default(uuid())
  name      String
  category  String
  priority  Int      // 1-5
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sessions  Session[]
}
```

### Session
```prisma
model Session {
  id            String      @id @default(uuid())
  sessionTypeId String
  scheduledAt   DateTime
  duration      Int         // minutes
  completed     Boolean     @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  sessionType   SessionType @relation(...)
}
```

### AvailabilityWindow
```prisma
model AvailabilityWindow {
  id        String   @id @default(uuid())
  dayOfWeek Int      // 0-6 (Sunday-Saturday)
  startTime String   // HH:MM
  endTime   String   // HH:MM
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Development Commands

### Back-end
```bash
npm run dev          # Start dev server (port 3001)
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio GUI
```

### Front-end
```bash
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on web
```

## Environment Variables

### Back-end (.env)
```env
DATABASE_URL="file:./dev.db"
```

### Front-end (.env)
```env
API_URL="http://localhost:3001"  # Or your deployed API URL
```

## Design System (Front-end)

The app uses a centralized theme system in `front-end/src/theme.ts`:

- **Colors:** Background, surfaces, text, accents, cards
- **Typography:** H1-H4, body, labels, captions
- **Spacing:** 4px base unit (xs, sm, md, lg, xl, xxl)
- **Radius:** Border radius values (sm, md, lg, xl, pill)

## Assumptions & Limitations

- SQLite database for simplicity (production would use PostgreSQL)
- Single user system (no authentication/multi-tenancy)
- Dates stored in UTC, displayed in local timezone
- Mobile-first design optimized for phones
- API runs on separate port (3001) from front-end

## Future Improvements

- User authentication & multi-user support
- Push notifications for upcoming sessions
- Calendar integration (Google Calendar, iCal)
- Advanced analytics & insights
- Session templates & recurring sessions
- Dark mode support
- Offline-first architecture with sync

## License

MIT
