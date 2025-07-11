const request = require('supertest');
const express = require('express');

// Mock database
const mockDb = require('../db');
const usersRouter = require('../routes/users');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/users', usersRouter);
  return app;
};

describe('Users Router', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockUsers = [
        {
          id: 1,
          name: 'Admin',
          email: 'admin@example.com',
          role: 'admin'
        },
        {
          id: 2,
          name: 'Trainer',
          email: 'trainer@example.com',
          role: 'trainer'
        }
      ];

      mockDb.query.mockResolvedValueOnce([mockUsers]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUsers);
      expect(response.body.message).toBe('Users retrieved successfully');
    });

    it('should return error for non-admin', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: insufficient role');
    });
  });

  describe('POST /api/users', () => {
    const newUser = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      role: 'trainer'
    };

    it('should create a new user for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      mockDb.query
        .mockResolvedValueOnce([[]]) // Check existing user
        .mockResolvedValueOnce([{ insertId: 3 }]) // Insert new user
        .mockResolvedValueOnce([[{ id: 3, ...newUser }]]); // Get new user

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newUser.name);
      expect(response.body.message).toBe('User created successfully');
    });

    it('should return error for existing email', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      mockDb.query.mockResolvedValueOnce([[{ id: 1 }]]); // User exists

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(newUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User with this email already exists');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockUser = {
        id: 2,
        name: 'Trainer',
        email: 'trainer@example.com',
        role: 'trainer'
      };

      mockDb.query.mockResolvedValueOnce([[mockUser]]);

      const response = await request(app)
        .get('/api/users/2')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
      expect(response.body.message).toBe('User retrieved successfully');
    });
  });

  describe('PUT /api/users/:id', () => {
    const updatedData = {
      name: 'Updated User',
      email: 'updated@example.com',
      role: 'trainer'
    };

    it('should update a user for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      mockDb.query
        .mockResolvedValueOnce([[{ id: 2 }]]) // Check existing user
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update user
        .mockResolvedValueOnce([[{ id: 2, ...updatedData }]]); // Get updated user

      const response = await request(app)
        .put('/api/users/2')
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updatedData.name);
      expect(response.body.message).toBe('User updated successfully');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockUser = {
        id: 2,
        name: 'Trainer',
        email: 'trainer@example.com',
        role: 'trainer'
      };

      mockDb.query
        .mockResolvedValueOnce([[mockUser]]) // Get user before delete
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete user

      const response = await request(app)
        .delete('/api/users/2')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedUser.email).toBe(mockUser.email);
      expect(response.body.message).toBe('User deleted successfully');
    });
  });
});

