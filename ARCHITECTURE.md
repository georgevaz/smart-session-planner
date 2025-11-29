# Architecture

## Tech Stack

### Front-end
- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tooling
- **TypeScript** - Type-safe JavaScript
- **React Native SVG** - Custom icon components

### Back-end
- **Next.js 16** - API Routes framework
- **TypeScript** - Type-safe API development
- **Prisma ORM** - Database toolkit and query builder
- **SQLite** - Development database (PostgreSQL/MySQL for production)

## Data Models

### SessionType
Defines categories of sessions with priorities.
- `id`: Unique identifier (UUID)
- `name`: Session type name (e.g., "Deep Work", "Workout")
- `category`: Category classification
- `priority`: Integer 1-5 (higher = more important)

### Session
Individual scheduled session instances.
- `id`: Unique identifier (UUID)
- `sessionTypeId`: Foreign key to SessionType
- `scheduledAt`: DateTime of session start
- `duration`: Duration in minutes
- `completed`: Boolean completion status

### AvailabilityWindow
User's available time slots throughout the week.
- `id`: Unique identifier (UUID)
- `dayOfWeek`: Integer 0-6 (Sunday-Saturday)
- `startTime`: Time in HH:MM format
- `endTime`: Time in HH:MM format

## API Endpoints

### Sessions
- `GET /api/sessions` - List sessions with optional filters
  - Query params: `upcoming`, `startDate`, `endDate`
- `GET /api/sessions/[id]` - Get single session
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/[id]` - Update session
- `DELETE /api/sessions/[id]` - Delete session

### Session Types
- `GET /api/session-types` - List all session types with completion counts

### Suggestions
- `GET /api/suggestions` - Get smart scheduling suggestions
  - Query params: `sessionTypeId`, `duration`, `daysAhead`, `limit`
- `POST /api/suggestions/accept` - Accept suggestion and create session

### Statistics
- `GET /api/stats` - Get comprehensive statistics
  - Overview metrics (total, completed, completion rate)
  - Stats by session type
  - Derived metrics (average spacing, upcoming count)
