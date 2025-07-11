const request = require('supertest');
const express = require('express');

// Mock database
const mockDb = require('../db');
const busySlotsRouter = require('../routes/busySlots');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/busy-slots', busySlotsRouter);
  return app;
};

describe('BusySlots Router', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('GET /api/busy-slots', () => {
    it('should return all busy slots for admin', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const mockBusySlots = [
        {
          id: 1,
          trainer_id: 2,
          start_time: '2024-01-15 10:00:00',
          end_time: '2024-01-15 12:00:00',
          reason: 'Personal appointment',
          trainer_name: 'Test Trainer',
          trainer_email: 'trainer@example.com'
        }
      ];

      mockDb.query.mockResolvedValueOnce([mockBusySlots]);

      const response = await request(app)
        .get('/api/busy-slots')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockBusySlots);
      expect(response.body.message).toBe('Busy slots retrieved successfully');
    });

    it('should return only trainer busy slots for trainer', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const mockBusySlots = [
        {
          id: 1,
          trainer_id: 2,
          start_time: '2024-01-15 10:00:00',
          end_time: '2024-01-15 12:00:00',
          reason: 'Personal appointment',
          trainer_name: 'Test Trainer',
          trainer_email: 'trainer@example.com'
        }
      ];

      mockDb.query.mockResolvedValueOnce([mockBusySlots]);

      const response = await request(app)
        .get('/api/busy-slots')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockBusySlots);
    });
  });

  describe('POST /api/busy-slots', () => {
    const busySlotData = {
      start_time: '2024-01-15 10:00:00',
      end_time: '2024-01-15 12:00:00',
      reason: 'Personal appointment'
    };

    it('should create a busy slot for trainer', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const mockResult = { insertId: 1 };
      const mockBusySlot = {
        id: 1,
        trainer_id: trainer.id,
        ...busySlotData,
        trainer_name: 'Test Trainer',
        trainer_email: 'trainer@example.com'
      };

      mockDb.query
        .mockResolvedValueOnce([[]]) // Check for conflicts
        .mockResolvedValueOnce([mockResult]) // Insert busy slot
        .mockResolvedValueOnce([[{ email: 'trainer@example.com', name: 'Test Trainer' }]]) // Get trainer info
        .mockResolvedValueOnce([{ insertId: 1 }]) // Insert notification
        .mockResolvedValueOnce([[mockBusySlot]]); // Get created busy slot

      const response = await request(app)
        .post('/api/busy-slots')
        .set('Authorization', `Bearer ${token}`)
        .send(busySlotData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reason).toBe(busySlotData.reason);
      expect(response.body.message).toBe('Busy slot created successfully');
    });

    it('should return error for missing fields', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const response = await request(app)
        .post('/api/busy-slots')
        .set('Authorization', `Bearer ${token}`)
        .send({ start_time: '2024-01-15 10:00:00' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Start and end time are required');
    });

    it('should return error for invalid time range', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const response = await request(app)
        .post('/api/busy-slots')
        .set('Authorization', `Bearer ${token}`)
        .send({
          start_time: '2024-01-15 12:00:00',
          end_time: '2024-01-15 10:00:00' // End before start
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('End time must be after start time');
    });

    it('should return error for overlapping busy slots', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      mockDb.query.mockResolvedValueOnce([[{ id: 1 }]]); // Conflict found

      const response = await request(app)
        .post('/api/busy-slots')
        .set('Authorization', `Bearer ${token}`)
        .send(busySlotData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Busy slot overlaps with existing busy time');
    });

    it('should return error for non-trainer', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const response = await request(app)
        .post('/api/busy-slots')
        .set('Authorization', `Bearer ${token}`)
        .send(busySlotData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: insufficient role');
    });
  });

  describe('GET /api/busy-slots/:id', () => {
    it('should return busy slot by ID', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const mockBusySlot = {
        id: 1,
        trainer_id: trainer.id,
        start_time: '2024-01-15 10:00:00',
        end_time: '2024-01-15 12:00:00',
        reason: 'Personal appointment',
        trainer_name: 'Test Trainer',
        trainer_email: 'trainer@example.com'
      };

      mockDb.query.mockResolvedValueOnce([[mockBusySlot]]);

      const response = await request(app)
        .get('/api/busy-slots/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockBusySlot);
      expect(response.body.message).toBe('Busy slot retrieved successfully');
    });

    it('should return 404 for non-existent busy slot', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      mockDb.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .get('/api/busy-slots/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Busy slot not found');
    });
  });

  describe('PUT /api/busy-slots/:id', () => {
    const updateData = {
      start_time: '2024-01-15 14:00:00',
      end_time: '2024-01-15 16:00:00',
      reason: 'Updated appointment'
    };

    it('should update busy slot for trainer', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const mockUpdatedBusySlot = {
        id: 1,
        trainer_id: trainer.id,
        ...updateData,
        trainer_name: 'Test Trainer',
        trainer_email: 'trainer@example.com'
      };

      mockDb.query
        .mockResolvedValueOnce([[{ id: 1 }]]) // Check existing busy slot
        .mockResolvedValueOnce([[]]) // Check for conflicts
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update busy slot
        .mockResolvedValueOnce([[mockUpdatedBusySlot]]); // Get updated busy slot

      const response = await request(app)
        .put('/api/busy-slots/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reason).toBe(updateData.reason);
      expect(response.body.message).toBe('Busy slot updated successfully');
    });

    it('should return error for non-trainer', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const response = await request(app)
        .put('/api/busy-slots/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: insufficient role');
    });
  });

  describe('DELETE /api/busy-slots/:id', () => {
    it('should delete busy slot for trainer', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      const mockBusySlot = {
        id: 1,
        trainer_id: trainer.id,
        start_time: '2024-01-15 10:00:00',
        end_time: '2024-01-15 12:00:00',
        reason: 'Personal appointment',
        trainer_name: 'Test Trainer',
        trainer_email: 'trainer@example.com'
      };

      mockDb.query
        .mockResolvedValueOnce([[mockBusySlot]]) // Get busy slot before delete
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete busy slot

      const response = await request(app)
        .delete('/api/busy-slots/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedBusySlot.reason).toBe(mockBusySlot.reason);
      expect(response.body.message).toBe('Busy slot deleted successfully');
    });

    it('should return 404 for non-existent busy slot', async () => {
      const trainer = createTestTrainer();
      const token = createTestToken(trainer);

      mockDb.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .delete('/api/busy-slots/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Busy slot not found');
    });

    it('should return error for non-trainer', async () => {
      const user = createTestUser();
      const token = createTestToken(user);

      const response = await request(app)
        .delete('/api/busy-slots/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied: insufficient role');
    });
  });
});
