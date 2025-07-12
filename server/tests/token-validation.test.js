/**
 * Backend Token Validation Test
 * Tests the server's ability to reject quoted tokens and accept unquoted tokens
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secure_jwt_secret_key_change_this_in_production_2024';

// Create a test app with the auth middleware
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    
    // Test route that requires authentication
    app.get('/protected', auth, (req, res) => {
        res.json({ 
            success: true, 
            message: 'Access granted', 
            user: req.user 
        });
    });
    
    return app;
};

describe('Token Validation Tests', () => {
    let app;
    let validToken;
    
    beforeAll(() => {
        app = createTestApp();
        
        // Create a valid token for testing
        validToken = jwt.sign(
            { id: 1, email: 'test@example.com', role: 'trainer' },
            JWT_SECRET,
            { expiresIn: '1h' }
        );
    });
    
    describe('Valid Token Tests', () => {
        test('should accept unquoted token', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${validToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Access granted');
        });
        
        test('should accept token with proper Bearer format', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${validToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.user.id).toBe(1);
            expect(response.body.user.email).toBe('test@example.com');
            expect(response.body.user.role).toBe('trainer');
        });
    });
    
    describe('Invalid Token Tests', () => {
        test('should reject quoted token', async () => {
            const quotedToken = `"${validToken}"`;
            
            const response = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${quotedToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid token');
        });
        
        test('should reject token with extra quotes', async () => {
            const doubleQuotedToken = `""${validToken}""`;
            
            const response = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${doubleQuotedToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid token');
        });
        
        test('should reject token with single quotes', async () => {
            const singleQuotedToken = `'${validToken}'`;
            
            const response = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${singleQuotedToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid token');
        });
        
        test('should reject malformed token', async () => {
            const malformedToken = 'not.a.valid.jwt.token';
            
            const response = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${malformedToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid token');
        });
        
        test('should reject empty token', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', 'Bearer ');
            
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid token format');
        });
        
        test('should reject request without Bearer prefix', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', validToken);
            
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Invalid token format');
        });
        
        test('should reject request without Authorization header', async () => {
            const response = await request(app)
                .get('/protected');
            
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('No authorization header provided');
        });
    });
    
    describe('Expired Token Tests', () => {
        test('should reject expired token', async () => {
            const expiredToken = jwt.sign(
                { id: 1, email: 'test@example.com', role: 'trainer' },
                JWT_SECRET,
                { expiresIn: '-1h' } // Expired 1 hour ago
            );
            
            const response = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${expiredToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Token expired');
        });
    });
    
    describe('Token Format Validation', () => {
        test('valid token should have 3 parts separated by dots', () => {
            const parts = validToken.split('.');
            expect(parts.length).toBe(3);
            expect(parts[0]).toBeTruthy(); // header
            expect(parts[1]).toBeTruthy(); // payload
            expect(parts[2]).toBeTruthy(); // signature
        });
        
        test('token should be decodable', () => {
            const decoded = jwt.decode(validToken);
            expect(decoded).toBeTruthy();
            expect(decoded.id).toBe(1);
            expect(decoded.email).toBe('test@example.com');
            expect(decoded.role).toBe('trainer');
        });
    });
});
