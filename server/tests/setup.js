// Test setup file
const jwt = require('jsonwebtoken');

// Mock environment variables
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test_password';

// Mock database module before any other imports
jest.mock('../db', () => {
  return {
    query: jest.fn()
  };
});

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn()
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  }))
}));

// Helper function to create test tokens
global.createTestToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Helper function to create test users
global.createTestUser = (overrides = {}) => {
  return {
    id: 1,
    email: 'test@example.com',
    role: 'admin',
    name: 'Test User',
    ...overrides
  };
};

global.createTestTrainer = (overrides = {}) => {
  return {
    id: 2,
    email: 'trainer@example.com',
    role: 'trainer', 
    name: 'Test Trainer',
    ...overrides
  };
};
