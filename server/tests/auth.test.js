const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

  // Extended Integration Tests with Edge Cases
  describe('Integration Tests - Edge Cases', () => {
    describe('Token Validation Edge Cases', () => {
      it('should reject token with extra spaces', async () => {
        const user = createTestUser();
        const token = createTestToken(user);
        const tokenWithSpaces = ` ${token} `;

        const response = await request(app)
          .get('/auth/verify')
          .set('Authorization', `Bearer ${tokenWithSpaces}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid token');
      });

      it('should reject token with wrong secret', async () => {
        const user = createTestUser();
        const invalidToken = jwt.sign(user, 'wrong_secret', { expiresIn: '1h' });

        const response = await request(app)
          .get('/auth/verify')
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid token');
      });

      it('should reject token with modified payload', async () => {
        const user = createTestUser();
        const token = createTestToken(user);
        const parts = token.split('.');
        const modifiedPayload = btoa(JSON.stringify({ ...user, role: 'admin' }));
        const modifiedToken = `${parts[0]}.${modifiedPayload}.${parts[2]}`;

        const response = await request(app)
          .get('/auth/verify')
          .set('Authorization', `Bearer ${modifiedToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Invalid token');
      });
    });

    describe('Registration Edge Cases', () => {
      it('should handle SQL injection attempts in registration', async () => {
        const maliciousData = {
          name: "'; DROP TABLE member; --",
          email: "test@example.com",
          password: "password123",
          role: "trainer"
        };

        mockDb.query.mockResolvedValueOnce([[]]); // No existing user
        mockDb.query.mockResolvedValueOnce([{ insertId: 1 }]); // Insert successful

        const response = await request(app)
          .post('/auth/register')
          .send(maliciousData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(mockDb.query).toHaveBeenCalledWith(
          'INSERT INTO member (name, email, password, role) VALUES (?, ?, ?, ?)',
          expect.arrayContaining(["'; DROP TABLE member; --", "test@example.com", expect.any(String), "trainer"])
        );
      });

      it('should handle very long input strings', async () => {
        const longString = 'a'.repeat(1000);
        const longData = {
          name: longString,
          email: `${longString}@example.com`,
          password: 'password123',
          role: 'trainer'
        };

        mockDb.query.mockResolvedValueOnce([[]]); // No existing user
        mockDb.query.mockResolvedValueOnce([{ insertId: 1 }]); // Insert successful

        const response = await request(app)
          .post('/auth/register')
          .send(longData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      it('should handle special characters in password', async () => {
        const specialData = {
          name: 'Test User',
          email: 'test@example.com',
          password: '!@#$%^&*()_+-=[]{}|;:,.<>?',
          role: 'trainer'
        };

        mockDb.query.mockResolvedValueOnce([[]]); // No existing user
        mockDb.query.mockResolvedValueOnce([{ insertId: 1 }]); // Insert successful

        const response = await request(app)
          .post('/auth/register')
          .send(specialData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });

    describe('Login Edge Cases', () => {
      it('should handle case-insensitive email lookup', async () => {
        const user = {
          id: 1,
          name: 'Test User',
          email: 'Test@Example.COM',
          password: 'hashed_password',
          role: 'trainer'
        };

        mockDb.query.mockResolvedValueOnce([[user]]);
        bcrypt.compare.mockResolvedValueOnce(true);

        const response = await request(app)
          .post('/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBeDefined();
      });

      it('should handle multiple login attempts with same credentials', async () => {
        const user = {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed_password',
          role: 'trainer'
        };

        mockDb.query.mockResolvedValue([[user]]);
        bcrypt.compare.mockResolvedValue(true);

        const loginData = { email: 'test@example.com', password: 'password123' };

        // First login
        const response1 = await request(app)
          .post('/auth/login')
          .send(loginData);

        // Small delay to ensure different timestamp in JWT
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Second login
        const response2 = await request(app)
          .post('/auth/login')
          .send(loginData);

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);
        expect(response1.body.data.token).toBeDefined();
        expect(response2.body.data.token).toBeDefined();
        expect(response1.body.data.token).not.toBe(response2.body.data.token);
      });

      it('should handle database connection errors during login', async () => {
        mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

        const response = await request(app)
          .post('/auth/login')
          .send({ email: 'test@example.com', password: 'password123' });

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Login failed. Please try again.');
      });
    });

    describe('Profile Update Edge Cases', () => {
      it('should handle profile update with same email', async () => {
        const user = createTestUser();
        const token = createTestToken(user);
        const updateData = {
          name: 'Updated Name',
          email: user.email // Same email
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
      });

      it('should handle profile update with password', async () => {
        const user = createTestUser();
        const token = createTestToken(user);
        const updateData = {
          name: 'Updated Name',
          email: 'updated@example.com',
          password: 'newpassword123'
        };

        mockDb.query
          .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update query
          .mockResolvedValueOnce([[{ ...user, name: updateData.name, email: updateData.email }]]); // Get updated user

        const response = await request(app)
          .put('/auth/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.name).toBe(updateData.name);
        expect(response.body.data.user.email).toBe(updateData.email);
      });

      it('should handle profile update with short password', async () => {
        const user = createTestUser();
        const token = createTestToken(user);
        const updateData = {
          name: 'Updated Name',
          email: 'updated@example.com',
          password: '123' // Too short
        };

        const response = await request(app)
          .put('/auth/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updateData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Password must be at least 6 characters long');
      });
    });
  });

  describe('Authentication Middleware Integration', () => {
    it('should properly handle concurrent authenticated requests', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const promises = Array.from({ length: 5 }, () => 
        request(app)
          .get('/auth/profile')
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.id).toBe(user.id);
      });
    });

    it('should handle mixed valid and invalid tokens', async () => {
      const user = createTestUser();
      const validToken = createTestToken(user);
      const invalidToken = 'invalid_token';

      const validResponse = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${validToken}`);

      const invalidResponse = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(validResponse.status).toBe(200);
      expect(validResponse.body.success).toBe(true);
      
      expect(invalidResponse.status).toBe(403);
      expect(invalidResponse.body.success).toBe(false);
    });
  });
});
