const request = require('supertest');
const path = require('path');
const app = require(path.join(__dirname, '../../src/app'));
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Endpoints Integration Tests', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.test.deleteMany();
    await prisma.endpoint.deleteMany();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.test.deleteMany();
    await prisma.endpoint.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /', () => {
    test('should render home page with empty endpoints list', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toContain('Load Tester');
    });

    test('should render home page with endpoints list', async () => {
      // Create test endpoint
      await prisma.endpoint.create({
        data: {
          name: 'Test API',
          url: 'https://api.example.com',
          method: 'GET'
        }
      });

      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toContain('Test API');
      expect(response.text).toContain('https://api.example.com');
    });
  });

  describe('GET /endpoints/new', () => {
    test('should render new endpoint form', async () => {
      const response = await request(app)
        .get('/endpoints/new')
        .expect(200);

      expect(response.text).toContain('Add New Endpoint');
      expect(response.text).toContain('name');
      expect(response.text).toContain('url');
      expect(response.text).toContain('method');
    });
  });

  describe('POST /endpoints', () => {
    test('should create new endpoint and redirect', async () => {
      const response = await request(app)
        .post('/endpoints')
        .send({
          name: 'New API',
          url: 'https://api.example.com',
          method: 'GET'
        })
        .expect(303);

      expect(response.headers.location).toBe('/');

      // Verify endpoint was created
      const endpoints = await prisma.endpoint.findMany();
      expect(endpoints).toHaveLength(1);
      expect(endpoints[0].name).toBe('New API');
    });

    test('should create endpoint with optional headers and body', async () => {
      const response = await request(app)
        .post('/endpoints')
        .send({
          name: 'API with Headers',
          url: 'https://api.example.com',
          method: 'POST',
          headers: '{"Authorization": "Bearer token"}',
          body: '{"key": "value"}'
        })
        .expect(303);

      const endpoint = await prisma.endpoint.findFirst();
      expect(endpoint.headers).toBe('{"Authorization": "Bearer token"}');
      expect(endpoint.body).toBe('{"key": "value"}');
    });

    test('should reject invalid endpoint data', async () => {
      const response = await request(app)
        .post('/endpoints')
        .send({
          name: '',
          url: 'not-a-url',
          method: 'INVALID'
        })
        .expect(400);

      // Verify no endpoint was created
      const endpoints = await prisma.endpoint.findMany();
      expect(endpoints).toHaveLength(0);
    });

    test('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/endpoints')
        .send({})
        .expect(400);

      const endpoints = await prisma.endpoint.findMany();
      expect(endpoints).toHaveLength(0);
    });
  });

  describe('GET /endpoints/:id/edit', () => {
    test('should render edit form with endpoint data', async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: 'Test API',
          url: 'https://api.example.com',
          method: 'GET'
        }
      });

      const response = await request(app)
        .get(`/endpoints/${endpoint.id}/edit`)
        .expect(200);

      expect(response.text).toContain('Edit Endpoint');
      expect(response.text).toContain('Test API');
      expect(response.text).toContain('https://api.example.com');
    });

    test('should return 404 for non-existent endpoint', async () => {
      await request(app)
        .get('/endpoints/999/edit')
        .expect(404);
    });
  });

  describe('PUT /endpoints/:id', () => {
    test('should update endpoint and redirect', async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: 'Old Name',
          url: 'https://api.example.com',
          method: 'GET'
        }
      });

      const response = await request(app)
        .put(`/endpoints/${endpoint.id}`)
        .send({
          name: 'New Name',
          url: 'https://api.updated.com',
          method: 'POST'
        })
        .expect(303);

      expect(response.headers.location).toBe('/');

      const updated = await prisma.endpoint.findUnique({
        where: { id: endpoint.id }
      });
      expect(updated.name).toBe('New Name');
      expect(updated.url).toBe('https://api.updated.com');
      expect(updated.method).toBe('POST');
    });

    test('should reject invalid update data', async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: 'Test API',
          url: 'https://api.example.com',
          method: 'GET'
        }
      });

      await request(app)
        .put(`/endpoints/${endpoint.id}`)
        .send({
          name: '',
          url: 'not-a-url',
          method: 'INVALID'
        })
        .expect(400);

      // Verify endpoint was not updated
      const notUpdated = await prisma.endpoint.findUnique({
        where: { id: endpoint.id }
      });
      expect(notUpdated.name).toBe('Test API');
    });

    test('should return 404 for non-existent endpoint', async () => {
      await request(app)
        .put('/endpoints/999')
        .send({
          name: 'Test',
          url: 'https://api.example.com',
          method: 'GET'
        })
        .expect(404);
    });
  });

  describe('DELETE /endpoints/:id', () => {
    test('should delete endpoint and redirect', async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: 'Test API',
          url: 'https://api.example.com',
          method: 'GET'
        }
      });

      const response = await request(app)
        .delete(`/endpoints/${endpoint.id}`)
        .expect(303);

      expect(response.headers.location).toBe('/');

      const deleted = await prisma.endpoint.findUnique({
        where: { id: endpoint.id }
      });
      expect(deleted).toBeNull();
    });

    test('should return 404 for non-existent endpoint', async () => {
      await request(app)
        .delete('/endpoints/999')
        .expect(404);
    });

    test('should cascade delete associated tests', async () => {
      const endpoint = await prisma.endpoint.create({
        data: {
          name: 'Test API',
          url: 'https://api.example.com',
          method: 'GET',
          tests: {
            create: {
              duration: 30,
              connections: 10,
              status: 'completed'
            }
          }
        }
      });

      await request(app)
        .delete(`/endpoints/${endpoint.id}`)
        .expect(303);

      const tests = await prisma.test.findMany({
        where: { endpointId: endpoint.id }
      });
      expect(tests).toHaveLength(0);
    });
  });
});
