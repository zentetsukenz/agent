/**
 * Database Seed Script
 * Creates built-in scenario templates
 *
 * Run: npm run prisma:seed
 */

const { getPrismaClient } = require('../src/config/database');

const templates = [
  {
    name: 'Smoke Test',
    description: 'Minimal load to verify endpoint works correctly. Use this to ensure basic functionality before running heavier tests.',
    mode: 'simple',
    isTemplate: true,
    phases: JSON.stringify([
      { name: 'Smoke', duration: 60, connections: 2, type: 'constant' }
    ]),
  },
  {
    name: 'Average Load Test',
    description: 'Simulate typical production traffic with gradual ramp-up and cooldown. Ideal for baseline performance measurements.',
    mode: 'simple',
    isTemplate: true,
    phases: JSON.stringify([
      { name: 'Ramp Up', duration: 30, connections: 50, type: 'ramp' },
      { name: 'Sustain', duration: 120, connections: 50, type: 'constant' },
      { name: 'Cool Down', duration: 30, connections: 0, type: 'ramp' }
    ]),
  },
  {
    name: 'Stress Test',
    description: 'Progressive load increase to find system limits and breaking points. Helps identify maximum capacity.',
    mode: 'simple',
    isTemplate: true,
    phases: JSON.stringify([
      { name: 'Baseline', duration: 60, connections: 50, type: 'ramp' },
      { name: 'Stress 1', duration: 60, connections: 100, type: 'ramp' },
      { name: 'Stress 2', duration: 60, connections: 200, type: 'ramp' },
      { name: 'Stress 3', duration: 60, connections: 300, type: 'ramp' },
      { name: 'Recovery', duration: 60, connections: 0, type: 'ramp' }
    ]),
  },
  {
    name: 'Spike Test',
    description: 'Sudden traffic spike to test system resilience and auto-scaling. Simulates flash sales or viral events.',
    mode: 'simple',
    isTemplate: true,
    phases: JSON.stringify([
      { name: 'Normal', duration: 30, connections: 20, type: 'constant' },
      { name: 'Spike Up', duration: 10, connections: 200, type: 'spike' },
      { name: 'Spike Hold', duration: 30, connections: 200, type: 'constant' },
      { name: 'Spike Down', duration: 10, connections: 20, type: 'ramp' },
      { name: 'Recovery', duration: 30, connections: 20, type: 'constant' }
    ]),
  },
  {
    name: 'Soak Test',
    description: 'Extended duration test to detect memory leaks, connection issues, and performance degradation over time.',
    mode: 'simple',
    isTemplate: true,
    phases: JSON.stringify([
      { name: 'Ramp Up', duration: 60, connections: 30, type: 'ramp' },
      { name: 'Soak', duration: 1800, connections: 30, type: 'constant' },
      { name: 'Cool Down', duration: 60, connections: 0, type: 'ramp' }
    ]),
  },
];

async function seed() {
  const prisma = getPrismaClient();

  console.log('🌱 Seeding database with scenario templates...');

  for (const template of templates) {
    try {
      // Use upsert to avoid duplicates
      const scenario = await prisma.scenario.upsert({
        where: { name: template.name },
        update: {
          description: template.description,
          mode: template.mode,
          phases: template.phases,
          isTemplate: true,
        },
        create: template,
      });

      console.log(`  ✅ ${scenario.name} (ID: ${scenario.id})`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${template.name}: ${error.message}`);
    }
  }

  console.log('🌱 Seeding complete!');
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = getPrismaClient();
    await prisma.$disconnect();
  });
