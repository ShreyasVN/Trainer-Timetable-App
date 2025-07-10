# 🔧 Troubleshooting Guide - JSON Errors & Authentication Issues

## **Common Issues and Solutions**

### **1. "Unexpected token '<', '<!DOCTYPE ...' is not valid JSON"**

**Cause**: Server is returning HTML instead of JSON (usually 404 or 500 error page)

**Solutions**:
- ✅ **FIXED**: API endpoints now correctly point to `/api/auth/login` and `/api/auth/register`
- ✅ **FIXED**: Server middleware order corrected
- ✅ **FIXED**: Added proper error handling middleware

### **2. "404 Not Found" Errors**

**Cause**: Incorrect API endpoint URLs

**Before (❌)**:
```javascript
// Client was calling:
fetch('http://localhost:5000/api/login')  // Wrong!
fetch('http://localhost:5000/api/register')  // Wrong!
```

**After (✅)**:
```javascript
// Client now calls:
fetch('http://localhost:5000/api/auth/login')  // Correct!
fetch('http://localhost:5000/api/auth/register')  // Correct!
```

### **3. CORS Errors**

**Cause**: Cross-origin requests blocked

**Solution**: ✅ **FIXED** - CORS middleware properly configured in server

### **4. Database Connection Issues**

**Setup Required**:
1. Create `.env` file in `server/` directory:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=trainer_timetable
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

2. Ensure MySQL database exists with `member` table:
```sql
CREATE TABLE member (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('trainer', 'admin') DEFAULT 'trainer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **5. Authentication Token Issues**

**Common Problems**:
- Token not being saved to localStorage
- Token expired (now set to 24h instead of 1h)
- Invalid token format

**Solutions**:
- ✅ **FIXED**: Token expiration extended to 24 hours
- ✅ **FIXED**: Better error messages for token issues
- ✅ **FIXED**: Proper token validation in middleware

## **Testing Steps**

### **1. Start the Server**
```bash
cd Trainer-Timetable-App/server
npm install
npm start
```

### **2. Start the Client**
```bash
cd Trainer-Timetable-App/client
npm install
npm start
```

### **3. Test Registration**
1. Go to `http://localhost:3000`
2. Click "Register"
3. Fill in email, password (min 6 chars), select role
4. Click "Register"
5. Should see "User registered successfully ✅"

### **4. Test Login**
1. Use the credentials from registration
2. Click "Login"
3. Should see "Login success" and be redirected

## **Debug Information**

### **Server Logs**
The server now logs:
- All incoming requests
- Registration errors
- Login errors
- Database connection issues

### **Client Console**
Check browser console for:
- Network request errors
- JSON parsing errors
- Authentication errors

## **Common Error Messages**

| Error | Cause | Solution |
|-------|-------|----------|
| "Route not found" | Wrong API endpoint | Use `/api/auth/login` not `/api/login` |
| "Invalid email or password" | Wrong credentials | Check email/password |
| "User already exists" | Duplicate registration | Use different email |
| "Password too short" | Password < 6 chars | Use longer password |
| "Database connection failed" | Missing .env or wrong DB config | Check database setup |

## **Role-Based Access**

- **Trainer**: Can view and manage their own sessions
- **Admin**: Can view all trainers and manage all sessions

## **Security Notes**

- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens expire after 24 hours
- ✅ Input validation prevents injection attacks
- ✅ CORS properly configured
- ⚠️ **Production**: Change JWT_SECRET and use HTTPS 