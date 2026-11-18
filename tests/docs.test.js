/** Vérifie que la documentation Swagger est servie et cohérente. */
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access';
process.env.JWT_REFRESH_SECRET = 'test_refresh';

const request = require('supertest');
const app = require('../src/app');

describe('Documentation Swagger', () => {
  it('sert la spécification OpenAPI en JSON', async () => {
    const res = await request(app).get('/api/docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining(['/auth/login', '/auth/register', '/users', '/users/{id}'])
    );
  });

  it('sert l\'interface Swagger UI', async () => {
    const res = await request(app).get('/api/docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});
