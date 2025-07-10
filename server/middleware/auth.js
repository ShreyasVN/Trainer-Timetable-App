// server/middleware/auth.js

const jwt = require('jsonwebtoken');

// Use environment variable for JWT secret if available
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
if (!process.env.JWT_SECRET) {
  console.warn('[WARN] Using default JWT secret. Set process.env.JWT_SECRET in production!');
}

// ✅ Authenticate token and attach user info to req.user
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // includes id and role
    next();
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// ✅ Role-based authorization middleware
function authorizeRole(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient role' });
    }
    next();
  };
}

module.exports = {
  auth,
  authorizeRole,
};
