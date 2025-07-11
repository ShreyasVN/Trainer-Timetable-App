const request = require('supertest');
const express = require('express');

// Mock database
const mockDb = require('../db');
const sessionsRouter = require('../routes/sessions');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/sessions', sessionsRouter);
  return app;
};

describe('Sessions Router', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('GET /api/sessions', () => {
    it('should return all sessions for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockSessions = [
        {
          id: 1,
          trainer_id: 2,
          course_name: 'Yoga',
          date: '2024-01-15',
          time: '10:00',
          location: 'Studio A',
          trainer_name: 'John Trainer',
          trainer_email: 'trainer@example.com'
        }
      ];

      mockDb.query.mockResolvedValueOnce([mockSessions]);

      const response = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSessions);
      expect(response.body.message).toBe('Sessions retrieved successfully');
    });

    it('should return only trainer sessions for trainer', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const mockSessions = [
        {
          id: 1,
          trainer_id: 2,
          course_name: 'Yoga',
          date: '2024-01-15',
          time: '10:00',
          location: 'Studio A',
          trainer_name: 'Test Trainer',
          trainer_email: 'trainer@example.com'
        }
      ];

      mockDb.query.mockResolvedValueOnce([mockSessions]);

      const response = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSessions);
    });
  });

  describe('POST /api/sessions', () => {
    const sessionData = {
      trainer_id: 2,
      course_name: 'Yoga',
      date: '2024-01-15',
      time: '10:00',
      location: 'Studio A',
      duration: 60
    };

    it('should create a session for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockResult = { insertId: 1 };
      const mockSession = {
        id: 1,
        ...sessionData,
        trainer_name: 'Test Trainer',
        trainer_email: 'trainer@example.com'
      };

      mockDb.query
        .mockResolvedValueOnce([mockResult]) // Insert session
        .mockResolvedValueOnce([[mockSession]]); // Get created session

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send(sessionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.course_name).toBe(sessionData.course_name);
      expect(response.body.message).toBe('Session created successfully');
    });

    it('should create pending session for trainer', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const mockResult = { insertId: 1 };
      const mockSession = {
        id: 1,
        ...sessionData,
        approval_status: 'pending',
        trainer_name: 'Test Trainer',
        trainer_email: 'trainer@example.com'
      };

      mockDb.query
        .mockResolvedValueOnce([[]]) // Check busy slots (no conflicts)
        .mockResolvedValueOnce([mockResult]) // Insert session
        .mockResolvedValueOnce([[{ email: 'trainer@example.com', name: 'Test Trainer' }]]) // Get trainer info
        .mockResolvedValueOnce([{ insertId: 1 }]) // Insert notification
        .mockResolvedValueOnce([[mockSession]]); // Get created session

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...sessionData, trainer_id: trainer.id });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.approval_status).toBe('pending');
    });

    it('should return error for missing fields', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const response = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ course_name: 'Yoga' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('All fields are required');
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('should return session by ID', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockSession = {
        id: 1,
        trainer_id: 2,
        course_name: 'Yoga',
        date: '2024-01-15',
        time: '10:00',
        location: 'Studio A',
        trainer_name: 'Test Trainer',
        trainer_email: 'trainer@example.com'
      };

      mockDb.query.mockResolvedValueOnce([[mockSession]]);

      const response = await request(app)
        .get('/api/sessions/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSession);
      expect(response.body.message).toBe('Session retrieved successfully');
    });

    it('should return 404 for non-existent session', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      mockDb.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .get('/api/sessions/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Session not found');
    });
  });

  describe('PUT /api/sessions/:id', () => {
    const updateData = {
      trainer_id: 2,
      course_name: 'Updated Yoga',
      date: '2024-01-16',
      time: '11:00',
      location: 'Studio B',
      duration: 90
    };

    it('should update session for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockUpdatedSession = {
        id: 1,
        ...updateData,
        trainer_name: 'Test Trainer',
        trainer_email: 'trainer@example.com'
      };

      mockDb.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // Check existing session
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update session
        .mockResolvedValueOnce([[mockUpdatedSession]]); // Get updated session

      const response = await request(app)
        .put('/api/sessions/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.course_name).toBe(updateData.course_name);
      expect(response.body.message).toBe('Session updated successfully');
    });

    it('should return error for non-admin', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const response = await request(app)
        .put('/api/sessions/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: insufficient role');
    });
  });

  describe('DELETE /api/sessions/:id', () => {
    it('should delete session for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockSession = {
        id: 1,
        trainer_id: 2,
        course_name: 'Yoga',
        trainer_name: 'Test Trainer',
        trainer_email: 'trainer@example.com'
      };

      mockDb.query
        .mockResolvedValueOnce([[mockSession]]) // Get session before delete
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete session

      const response = await request(app)
        .delete('/api/sessions/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedSession.course_name).toBe(mockSession.course_name);
      expect(response.body.message).toBe('Session deleted successfully');
    });
  });

  describe('PATCH /api/sessions/:id/attendance', () => {
    it('should toggle attendance for trainer', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      mockDb.query
        .mockResolvedValueOnce([[{ attended: 0 }]]) // Get current attendance
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Update attendance

      const response = await request(app)
        .patch('/api/sessions/1/attendance')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.attended).toBe(1);
      expect(response.body.message).toBe('Attendance updated successfully');
    });
  });

  describe('PUT /api/sessions/:id/approve', () => {
    it('should approve session for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockUpdatedSession = {
        id: 1,
        approval_status: 'approved',
        trainer_name: 'Test Trainer',
        trainer_email: 'trainer@example.com'
      };

      mockDb.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // Check existing session
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update approval status
        .mockResolvedValueOnce([[mockUpdatedSession]]); // Get updated session

      const response = await request(app)
        .put('/api/sessions/1/approve')
        .set('Authorization', `Bearer ${token}`)
        .send({ approval_status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.approval_status).toBe('approved');
      expect(response.body.message).toBe('Session approval status updated successfully');
    });
  });
});
