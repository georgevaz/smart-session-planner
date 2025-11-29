const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.session.deleteMany();
  await prisma.availabilityWindow.deleteMany();
  await prisma.sessionType.deleteMany();

  // Create Session Types with different priorities
  const deepWork = await prisma.sessionType.create({
    data: {
      name: 'Deep Work',
      category: 'productivity',
      priority: 5, // Highest priority
    },
  });

  const workout = await prisma.sessionType.create({
    data: {
      name: 'Workout',
      category: 'fitness',
      priority: 4,
    },
  });

  const languagePractice = await prisma.sessionType.create({
    data: {
      name: 'Language Practice',
      category: 'learning',
      priority: 3,
    },
  });

  const reading = await prisma.sessionType.create({
    data: {
      name: 'Reading',
      category: 'learning',
      priority: 2,
    },
  });

  const meditation = await prisma.sessionType.create({
    data: {
      name: 'Meditation',
      category: 'wellness',
      priority: 3,
    },
  });

  console.log('✓ Created session types: Deep Work, Workout, Language Practice, Reading, Meditation');

  // Create Availability Windows
  const windows = [
    // Monday
    { dayOfWeek: 1, startTime: '06:00', endTime: '08:00' }, // Morning
    { dayOfWeek: 1, startTime: '19:00', endTime: '21:00' }, // Evening
    // Tuesday
    { dayOfWeek: 2, startTime: '06:00', endTime: '08:00' }, // Morning
    { dayOfWeek: 2, startTime: '19:00', endTime: '21:00' }, // Evening
    // Wednesday
    { dayOfWeek: 3, startTime: '06:00', endTime: '08:00' }, // Morning
    { dayOfWeek: 3, startTime: '12:00', endTime: '13:00' }, // Lunch
    { dayOfWeek: 3, startTime: '19:00', endTime: '21:00' }, // Evening
    // Thursday
    { dayOfWeek: 4, startTime: '06:00', endTime: '08:00' }, // Morning
    { dayOfWeek: 4, startTime: '19:00', endTime: '21:00' }, // Evening
    // Friday
    { dayOfWeek: 5, startTime: '06:00', endTime: '08:00' }, // Morning
    { dayOfWeek: 5, startTime: '19:00', endTime: '21:00' }, // Evening
    // Saturday
    { dayOfWeek: 6, startTime: '09:00', endTime: '12:00' }, // Morning
    { dayOfWeek: 6, startTime: '14:00', endTime: '17:00' }, // Afternoon
    // Sunday
    { dayOfWeek: 0, startTime: '09:00', endTime: '11:00' }, // Morning
  ];

  for (const window of windows) {
    await prisma.availabilityWindow.create({ data: window });
  }

  console.log('✓ Created availability windows');

  // Using Monday, November 17, 2025 as "today"
  const today = new Date('2025-11-17T12:00:00');

  // ========================================
  // HISTORICAL COMPLETED SESSIONS (Past 3 weeks)
  // This data helps establish spacing patterns
  // ========================================

  // Deep Work sessions - Every ~2-3 days (typical pattern)
  const deepWorkSessions = [
    { date: new Date('2025-10-28T07:00:00'), duration: 90, completed: true },  // 20 days ago
    { date: new Date('2025-10-31T07:00:00'), duration: 120, completed: true }, // 17 days ago
    { date: new Date('2025-11-03T19:00:00'), duration: 90, completed: true },  // 14 days ago
    { date: new Date('2025-11-06T07:00:00'), duration: 60, completed: true },  // 11 days ago
    { date: new Date('2025-11-09T19:00:00'), duration: 120, completed: true }, // 8 days ago
    { date: new Date('2025-11-12T07:00:00'), duration: 90, completed: true },  // 5 days ago
    { date: new Date('2025-11-15T19:00:00'), duration: 60, completed: true },  // 2 days ago (Saturday)
  ];

  for (const session of deepWorkSessions) {
    await prisma.session.create({
      data: {
        sessionTypeId: deepWork.id,
        scheduledAt: session.date,
        duration: session.duration,
        completed: session.completed,
      },
    });
  }

  // Workout sessions - Every ~2 days (consistent pattern)
  const workoutSessions = [
    { date: new Date('2025-10-29T06:30:00'), duration: 45, completed: true },  // 19 days ago
    { date: new Date('2025-11-01T06:30:00'), duration: 60, completed: true },  // 16 days ago
    { date: new Date('2025-11-03T06:30:00'), duration: 45, completed: true },  // 14 days ago
    { date: new Date('2025-11-05T19:30:00'), duration: 60, completed: true },  // 12 days ago
    { date: new Date('2025-11-08T06:30:00'), duration: 45, completed: true },  // 9 days ago
    { date: new Date('2025-11-10T19:30:00'), duration: 60, completed: true },  // 7 days ago
    { date: new Date('2025-11-13T06:30:00'), duration: 45, completed: true },  // 4 days ago
    { date: new Date('2025-11-15T06:30:00'), duration: 60, completed: true },  // 2 days ago (Saturday)
  ];

  for (const session of workoutSessions) {
    await prisma.session.create({
      data: {
        sessionTypeId: workout.id,
        scheduledAt: session.date,
        duration: session.duration,
        completed: session.completed,
      },
    });
  }

  // Language Practice sessions - Every ~3 days
  const languageSessions = [
    { date: new Date('2025-11-01T12:00:00'), duration: 30, completed: true },  // 16 days ago
    { date: new Date('2025-11-04T12:00:00'), duration: 30, completed: true },  // 13 days ago
    { date: new Date('2025-11-07T19:00:00'), duration: 30, completed: true },  // 10 days ago
    { date: new Date('2025-11-11T12:00:00'), duration: 30, completed: true },  // 6 days ago
    { date: new Date('2025-11-14T19:00:00'), duration: 30, completed: true },  // 3 days ago
  ];

  for (const session of languageSessions) {
    await prisma.session.create({
      data: {
        sessionTypeId: languagePractice.id,
        scheduledAt: session.date,
        duration: session.duration,
        completed: session.completed,
      },
    });
  }

  // Reading sessions - Sporadic (every 5-7 days)
  const readingSessions = [
    { date: new Date('2025-11-02T20:00:00'), duration: 45, completed: true },  // 15 days ago
    { date: new Date('2025-11-08T20:00:00'), duration: 60, completed: true },  // 9 days ago
    { date: new Date('2025-11-14T20:00:00'), duration: 45, completed: true },  // 3 days ago
  ];

  for (const session of readingSessions) {
    await prisma.session.create({
      data: {
        sessionTypeId: reading.id,
        scheduledAt: session.date,
        duration: session.duration,
        completed: session.completed,
      },
    });
  }

  // Meditation sessions - Very consistent (almost daily)
  const meditationSessions = [
    { date: new Date('2025-11-10T06:00:00'), duration: 15, completed: true },  // 7 days ago
    { date: new Date('2025-11-11T06:00:00'), duration: 15, completed: true },  // 6 days ago
    { date: new Date('2025-11-12T06:00:00'), duration: 15, completed: true },  // 5 days ago
    { date: new Date('2025-11-13T06:00:00'), duration: 15, completed: true },  // 4 days ago
    { date: new Date('2025-11-14T06:00:00'), duration: 15, completed: true },  // 3 days ago
    { date: new Date('2025-11-16T06:00:00'), duration: 15, completed: true },  // 1 day ago (Sunday)
  ];

  for (const session of meditationSessions) {
    await prisma.session.create({
      data: {
        sessionTypeId: meditation.id,
        scheduledAt: session.date,
        duration: session.duration,
        completed: session.completed,
      },
    });
  }

  console.log('✓ Created historical completed sessions (past 3 weeks)');

  // ========================================
  // TODAY'S SESSIONS (Monday, Nov 17, 2025)
  // ========================================

  // Morning meditation (completed)
  await prisma.session.create({
    data: {
      sessionTypeId: meditation.id,
      scheduledAt: new Date('2025-11-17T06:00:00'),
      duration: 15,
      completed: true,
    },
  });

  // Deep Work session (upcoming - creates high priority load for today)
  await prisma.session.create({
    data: {
      sessionTypeId: deepWork.id,
      scheduledAt: new Date('2025-11-17T14:00:00'), // 2:00 PM
      duration: 120,
      completed: false,
    },
  });

  console.log('✓ Created today\'s sessions');

  // ========================================
  // UPCOMING SESSIONS (This week)
  // ========================================

  // Wednesday already has a reading session scheduled
  await prisma.session.create({
    data: {
      sessionTypeId: reading.id,
      scheduledAt: new Date('2025-11-19T12:00:00'), // Wed 12:00 PM
      duration: 45,
      completed: false,
    },
  });

  // Friday evening has a workout planned
  await prisma.session.create({
    data: {
      sessionTypeId: workout.id,
      scheduledAt: new Date('2025-11-21T19:00:00'), // Fri 7:00 PM
      duration: 60,
      completed: false,
    },
  });

  console.log('✓ Created upcoming sessions');

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n📊 Seeding Summary:');
  console.log('───────────────────────────────────────');
  console.log('Session Types: 5 (priorities 2-5)');
  console.log('Availability Windows: 14 time slots across the week');
  console.log('Historical Sessions: ~30 completed sessions over 3 weeks');
  console.log('Today\'s Date: Monday, November 17, 2025');
  console.log('Today\'s Sessions: 2 (1 completed, 1 upcoming)');
  console.log('Upcoming Sessions: 2 scheduled this week');
  console.log('───────────────────────────────────────');
  console.log('\n💡 Spacing Patterns Established:');
  console.log('   • Deep Work: ~2-3 days (last: 2 days ago)');
  console.log('   • Workout: ~2 days (last: 2 days ago)');
  console.log('   • Language: ~3 days (last: 3 days ago)');
  console.log('   • Reading: ~5-7 days (last: 3 days ago)');
  console.log('   • Meditation: ~1 day (last: today - completed)');
  console.log('\n✅ Seeding completed successfully!');
  console.log('🔍 Algorithm should now demonstrate:');
  console.log('   ✓ Priority-based scoring (Deep Work ranked highest)');
  console.log('   ✓ Recency bonuses (sessions overdue get boosted)');
  console.log('   ✓ Spacing consistency (matches historical patterns)');
  console.log('   ✓ Daily load penalties (busy days get penalized)');
  console.log('   ✓ Time-of-day preferences (morning for high-priority)');
  console.log('   ✓ Buffer time bonuses (slots with breathing room)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
