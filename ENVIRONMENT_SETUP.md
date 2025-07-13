# Environment Setup Guide

## Overview

This guide covers the complete environment setup for the Trainer Timetable Application, including both client and server configurations.

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

## Environment Files

### Server Environment (server/.env)

```env
# Server Environment Variables
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root@123
DB_NAME=trainer_timetable
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3001

# Development Settings
NODE_ENV=development
```

### Client Environment (client/.env)

```env
# React Client Environment Variables
# Server Configuration
PORT=3001

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000

# Application Configuration
REACT_APP_APP_NAME=Trainer Timetable App
REACT_APP_VERSION=1.0.0

# Development Settings
REACT_APP_DEBUG=true
REACT_APP_ENABLE_EXAMPLES=false

# Authentication
REACT_APP_TOKEN_KEY=token

# Features
REACT_APP_ENABLE_ANIMATIONS=true
REACT_APP_ENABLE_DEMO_MODE=false
```

## Port Configuration

- **Server**: Port 5000
- **Client**: Port 3001

## Quick Start

### 1. Environment Validation

Run the pre-flight check to ensure all environment variables are properly configured:

```bash
npm run check-env
```

### 2. Start Development Environment

Start both client and server with automatic environment validation:

```bash
npm run dev
```

### 3. Individual Service Management

**Start Server Only:**
```bash
npm run server
```

**Start Client Only:**
```bash
npm run client
```

**Build Client:**
```bash
npm run build
```

## Environment Variables Reference

### Required Server Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_USER` | Database username | `root` |
| `DB_PASSWORD` | Database password | `root@123` |
| `DB_NAME` | Database name | `trainer_timetable` |
| `DB_PORT` | Database port | `3306` |
| `JWT_SECRET` | JWT signing secret | `your_secure_secret_key` |

### Required Client Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Client port | `3001` |
| `REACT_APP_API_URL` | API base URL | `http://localhost:5000/api` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3001` |
| `NODE_ENV` | Environment mode | `development` |
| `REACT_APP_API_TIMEOUT` | API request timeout | `10000` |
| `REACT_APP_DEBUG` | Debug mode | `false` |

## Security Notes

1. **JWT Secret**: Always use a secure, randomly generated JWT secret in production
2. **Database Credentials**: Never commit real database credentials to version control
3. **Environment Files**: Add `.env` files to `.gitignore` to prevent accidental commits

## Troubleshooting

### Common Issues

1. **Port Already in Use**: If ports 5000 or 3001 are in use, change them in the respective `.env` files
2. **Database Connection**: Ensure MySQL is running and credentials are correct
3. **CORS Issues**: Make sure `CORS_ORIGIN` matches your client URL

### Pre-flight Check Failures

The pre-flight script will fail if:
- Required environment variables are missing
- JWT_SECRET is using a default value
- Port values are not numeric
- API URLs are malformed

### Debug Mode

Enable debug mode in the client by setting:
```env
REACT_APP_DEBUG=true
```

This will show detailed API request/response logs in the browser console.

## Development Workflow

1. Run `npm run check-env` to validate configuration
2. Run `npm run dev` to start both services
3. Access the application at `http://localhost:3001`
4. API endpoints are available at `http://localhost:5000/api`

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use secure JWT secrets
3. Configure proper CORS origins
4. Use environment-specific database credentials
5. Run `npm run build` to create optimized client build
