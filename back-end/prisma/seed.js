const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.session.deleteMany();
  await prisma.availabilityWindow.deleteMany();
  await prisma.sessionType.deleteMany();

  // Create Session Types
  const deepWork = await prisma.sessionType.create({
    data: {
      name: 'Deep Work',
      category: 'productivity',
      priority: 5,
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

  console.log('✓ Created session types: Deep Work, Workout, Language Practice');

  // Create Availability Windows
  const windows = [
    // Monday evening
    { dayOfWeek: 1, startTime: '19:00', endTime: '21:00' },
    // Tuesday morning
    { dayOfWeek: 2, startTime: '06:00', endTime: '08:00' },
    // Tuesday evening
    { dayOfWeek: 2, startTime: '19:00', endTime: '21:00' },
    // Wednesday lunch
    { dayOfWeek: 3, startTime: '12:00', endTime: '13:00' },
    // Wednesday evening
    { dayOfWeek: 3, startTime: '19:00', endTime: '21:00' },
    // Thursday evening
    { dayOfWeek: 4, startTime: '19:00', endTime: '21:00' },
    // Friday evening
    { dayOfWeek: 5, startTime: '19:00', endTime: '21:00' },
  ];

  for (const window of windows) {
    await prisma.availabilityWindow.create({ data: window });
  }

  console.log('✓ Created availability windows');

  // Create some past sessions to demonstrate spacing
  // Using Monday, November 17, 2025 as "today"
  const today = new Date('2025-11-17T12:00:00');

  // Last Deep Work session was 1.5 days ago (Saturday Nov 15 at 7:00 PM)
  const lastDeepWork = new Date('2025-11-15T19:00:00');
  await prisma.session.create({
    data: {
      sessionTypeId: deepWork.id,
      scheduledAt: lastDeepWork,
      duration: 60,
      completed: true,
    },
  });

  // Last Language Practice was 2 days ago (Saturday Nov 15 at 12:00 PM)
  const lastLanguagePractice = new Date('2025-11-15T12:00:00');
  await prisma.session.create({
    data: {
      sessionTypeId: languagePractice.id,
      scheduledAt: lastLanguagePractice,
      duration: 30,
      completed: true,
    },
  });

  console.log('✓ Created past sessions for spacing demonstration');

  // Create today's sessions (Monday, Nov 17)
  // Morning Meditation at 7:00-7:30 am (completed)
  await prisma.session.create({
    data: {
      sessionTypeId: workout.id, // Using workout as a placeholder for meditation
      scheduledAt: new Date('2025-11-17T07:00:00'),
      duration: 30,
      completed: true,
    },
  });

  // Client Meeting at 10:00-11:00 am (upcoming)
  await prisma.session.create({
    data: {
      sessionTypeId: deepWork.id, // Using deep work as placeholder
      scheduledAt: new Date('2025-11-17T10:00:00'),
      duration: 60,
      completed: false,
    },
  });

  // Deep Work at 2:00-4:00 pm (upcoming)
  await prisma.session.create({
    data: {
      sessionTypeId: deepWork.id,
      scheduledAt: new Date('2025-11-17T14:00:00'),
      duration: 120,
      completed: false,
    },
  });

  console.log('✓ Created today\'s sessions');
  console.log('\n✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
