/**
 * Tests d'intégration : Jest + Supertest + MongoDB en mémoire.
 * Aucune base réelle n'est nécessaire pour lancer `npm test`.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access';
process.env.JWT_REFRESH_SECRET = 'test_refresh';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDB, disconnectDB } = require('../src/config/database');
const app = require('../src/app');
const { User } = require('../src/models/User');

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connectDB(mongo.getUri());
});
afterAll(async () => {
  await disconnectDB();
  await mongo.stop();
});

const credentials = { name: 'Alice', email: 'alice@example.com', password: 'motdepasse1' };

describe('Authentification', () => {
  let tokens;

  it('inscrit un utilisateur', async () => {
    const res = await request(app).post('/api/auth/register').send(credentials);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(credentials.email);
    expect(res.body.data.user.password).toBeUndefined();
    tokens = res.body.data;
  });

  it('refuse un email déjà utilisé', async () => {
    const res = await request(app).post('/api/auth/register').send(credentials);
    expect(res.status).toBe(409);
  });

  it('refuse des données invalides', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x', password: '1' });
    expect(res.status).toBe(422);
  });

  it('connecte l\'utilisateur', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password });
    expect(res.status).toBe(200);
    tokens = res.body.data;
  });

  it('refuse un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'mauvais123' });
    expect(res.status).toBe(401);
  });

  it('accède à /me avec un jeton valide', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokens.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Alice');
  });

  it('refuse /me sans jeton', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('renouvelle les jetons puis refuse l\'ancien refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: tokens.refreshToken });
    expect(res.status).toBe(200);
    const reuse = await request(app).post('/api/auth/refresh').send({ refreshToken: tokens.refreshToken });
    expect(reuse.status).toBe(401);
    tokens = res.body.data;
  });
});

describe('Autorisation par rôle', () => {
  it('refuse la liste des utilisateurs à un non-admin (403)', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password });
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`);
    expect(res.status).toBe(403);
  });

  it('autorise la liste des utilisateurs à un admin', async () => {
    await User.updateOne({ email: credentials.email }, { role: 'admin' });
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password });
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(1);
  });
});
