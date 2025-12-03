const request = require('supertest');
const path = require('path');
const app = require(path.join(__dirname, '../../src/app'));
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Tests Integration Tests', () => {
  let testEndpoint;

  beforeAll(async () => {
    await prisma.test.deleteMany();
    await prisma.endpoint.deleteMany();
  });

  beforeEach(async () => {
    // Create a test endpoint
    testEndpoint = await prisma.endpoint.create({
      data: {
        name: 'Test API',
        url: 'https://httpbin.org/get',
        method: 'GET'
      }
    });
  });

  afterEach(async () => {
    await prisma.test.deleteMany();
    await prisma.endpoint.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /endpoints/:id/test', () => {
    test('should render test configuration page', async () => {
      const response = await request(app)
        .get(`/endpoints/${testEndpoint.id}/test`)
        .expect(200);

      expect(response.text).toContain('Load Test Configuration');
      expect(response.text).toContain('Test API');
      expect(response.text).toContain('duration');
      expect(response.text).toContain('connections');
    });

    test('should return 404 for non-existent endpoint', async () => {
      await request(app)
        .get('/endpoints/999/test')
        .expect(404);
    });
  });

  describe('POST /endpoints/:id/test', () => {
    test('should create test and redirect to results', async () => {
      const response = await request(app)
        .post(`/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 10,
          connections: 5,
          rps: 50
        })
        .expect(303);

      expect(response.headers.location).toMatch(/\/tests\/\d+\/results/);

      // Verify test was created
      const tests = await prisma.test.findMany();
      expect(tests).toHaveLength(1);
      expect(tests[0].duration).toBe(10);
      expect(tests[0].connections).toBe(5);
      expect(tests[0].rps).toBe(50);
    });

    test('should create test without optional rps', async () => {
      const response = await request(app)
        .post(`/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 10,
          connections: 5
        })
        .expect(303);

      const test = await prisma.test.findFirst();
      expect(test.rps).toBeNull();
    });

    test('should reject invalid test configuration', async () => {
      await request(app)
        .post(`/endpoints/${testEndpoint.id}/test`)
        .send({
          duration: 0,
          connections: 1001,
          rps: -1
        })
        .expect(400);

      const tests = await prisma.test.findMany();
      expect(tests).toHaveLength(0);
    });

    test('should return 404 for non-existent endpoint', async () => {
      await request(app)
        .post('/endpoints/999/test')
        .send({
          duration: 10,
          connections: 5
        })
        .expect(404);
    });
  });

  describe('GET /tests/:id/results', () => {
    test('should render test results for completed test', async () => {
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 10,
          connections: 5,
          status: 'completed',
          results: JSON.stringify({
            requests: { total: 100, average: 10, sent: 100 },
            latency: { min: 10, max: 100, mean: 50, p50: 45, p90: 80, p95: 90, p99: 95 },
            throughput: { average: 1000, total: 10000 },
            errors: 0,
            timeouts: 0,
            successRate: 100,
            duration: 10
          }),
          completedAt: new Date()
        }
      });

      const response = await request(app)
        .get(`/tests/${test.id}/results`)
        .expect(200);

      expect(response.text).toContain('Test Results');
      expect(response.text).toContain('Test API');
      expect(response.text).toContain('100'); // success rate
    });

    test('should render pending status for running test', async () => {
      const test = await prisma.test.create({
        data: {
          endpointId: testEndpoint.id,
          duration: 10,
          connections: 5,
          status: 'running'
        }
      });

      const response = await request(app)
        .get(`/tests/${test.id}/results`)
        .expect(200);

      expect(response.text).toContain('running');
    });

    test('should return 404 for non-existent test', async () => {
      await request(app)
        .get('/tests/999/results')
        .expect(404);
    });
  });
});
