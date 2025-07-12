const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');

// Mock database
const mockDb = require('../db');
const authRouter = require('../routes/auth');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRouter);
  return app;
};

describe('Auth Router', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    const validUser = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'trainer'
    };

    it('should register a new user successfully', async () => {
      mockDb.query
        .mockResolvedValueOnce([[]]) // Check existing user
        .mockResolvedValueOnce([{ insertId: 1 }]); // Insert new user

      const response = await request(app)
        .post('/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(1);
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should return error for missing fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ name: 'John' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Name, email, password, and role are required');
    });

    it('should return error for short password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ ...validUser, password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Password must be at least 6 characters long');
    });

    it('should return error for invalid role', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ ...validUser, role: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Role must be either "trainer" or "admin"');
    });

    it('should return error for existing email', async () => {
      mockDb.query.mockResolvedValueOnce([[{ id: 1 }]]); // User exists

      const response = await request(app)
        .post('/auth/register')
        .send(validUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User with this email already exists');
    });
  });

  describe('POST /auth/login', () => {
    const loginData = {
      email: 'john@example.com',
      password: 'password123'
    };

    it('should login successfully with valid credentials', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        role: 'trainer'
      };

      mockDb.query.mockResolvedValueOnce([[user]]);
      bcrypt.compare.mockResolvedValueOnce(true);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.user.role).toBe(user.role);
      expect(response.body.message).toBe('Login successful');
    });

    it('should return error for missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email and password are required');
    });

    it('should return error for non-existent user', async () => {
      mockDb.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it('should return error for invalid password', async () => {
      const user = {
        id: 1,
        email: 'john@example.com',
        password: 'hashed_password',
        role: 'trainer'
      };

      mockDb.query.mockResolvedValueOnce([[user]]);
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile for authenticated user', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.message).toBe('Profile retrieved successfully');
    });

    it('should return error for unauthenticated request', async () => {
      const response = await request(app)
        .get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No authorization header provided');
    });
  });

  describe('PUT /auth/profile', () => {
    it('should update user profile successfully', async () => {
      const user = createTestUser();
      const token = createTestToken(user);
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      mockDb.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update query
        .mockResolvedValueOnce([[{ ...user, ...updateData }]]); // Get updated user

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.email).toBe(updateData.email);
      expect(response.body.message).toBe('Profile updated successfully');
    });

    it('should return error for missing required fields', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const response = await request(app)
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Only Name' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Name and email are required');
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify valid token', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.message).toBe('Token is valid');
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid token');
    });
  });
});
