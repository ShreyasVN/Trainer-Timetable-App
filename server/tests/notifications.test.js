const request = require('supertest');
const express = require('express');

// Mock database
const mockDb = require('../db');
const notificationsRouter = require('../routes/notifications');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/notifications', notificationsRouter);
  return app;
};

describe('Notifications Router', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('GET /api/notifications', () => {
    it('should return notifications for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockNotifications = [
        {
          id: 1,
          type: 'session',
          message: 'Session scheduled',
          recipient_role: 'admin',
          read: false
        }
      ];

      mockDb.query.mockResolvedValueOnce([mockNotifications])
              .mockResolvedValueOnce([[{ total: mockNotifications.length }]]);

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toEqual(mockNotifications);
      expect(response.body.message).toBe('Notifications retrieved successfully');
    });

    it('should return error for non-admin', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: insufficient role');
    });
  });

  describe('POST /api/notifications', () => {
    const notificationData = {
      type: 'busy',
      message: 'Trainer added busy slot'
    };

    it('should create a notification for trainer', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const mockResult = { insertId: 1 };
      const mockNotification = { id: 1, ...notificationData, recipient_role: 'admin' };

      mockDb.query
        .mockResolvedValueOnce([mockResult]) // Insert notification
        .mockResolvedValueOnce([[mockNotification]]); // Get created notification

      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send(notificationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe(notificationData.message);
      expect(response.body.message).toBe('Notification created successfully');
    });

    it('should return error for non-trainer', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send(notificationData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: insufficient role');
    });
  });

  describe('GET /api/notifications/:id', () => {
    it('should return notification by ID for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockNotification = {
        id: 1,
        type: 'session',
        message: 'Session scheduled',
        recipient_role: 'admin',
        read: false
      };

      mockDb.query.mockResolvedValueOnce([[mockNotification]]);

      const response = await request(app)
        .get('/api/notifications/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockNotification);
      expect(response.body.message).toBe('Notification retrieved successfully');
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark notification as read for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockNotification = {
        id: 1,
        type: 'session',
        message: 'Session scheduled',
        recipient_role: 'admin',
        read: true
      };

      mockDb.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // Check existing notification
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Mark as read
        .mockResolvedValueOnce([[mockNotification]]); // Get updated notification

      const response = await request(app)
        .patch('/api/notifications/1/read')
        .set('Authorization', `Bearer ${token}`)
        .send({ read: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.read).toBe(true);
      expect(response.body.message).toBe('Notification marked as read');
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete notification for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockNotification = {
        id: 1,
        type: 'session',
        message: 'Session scheduled',
        recipient_role: 'admin',
        read: false
      };

      mockDb.query
        .mockResolvedValueOnce([[mockNotification]]) // Get notification before delete
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete notification

      const response = await request(app)
        .delete('/api/notifications/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedNotification.message).toBe(mockNotification.message);
      expect(response.body.message).toBe('Notification deleted successfully');
    });
  });
});

