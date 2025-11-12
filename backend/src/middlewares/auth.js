const jwt = require('jsonwebtoken');
const db = require('../db');
const secret = process.env.JWT_SECRET || 'secret';

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, secret);
    // attach user
    const user = await db('Users').where('user_id', payload.userId).first();
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;
