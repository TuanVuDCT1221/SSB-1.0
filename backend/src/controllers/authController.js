const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'secret';

async function register(req, res, next) {
  try {
    const { email, password, full_name, role, phone_number } = req.body;
    if (!email || !password || !full_name || !role) return res.status(400).json({ error: 'Missing fields' });
    const hashed = await bcrypt.hash(password, 8);
    const [id] = await db('Users').insert({
      email, password: hashed, full_name, role, phone_number
    });
    res.json({ ok: true, user_id: id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email exists' });
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
    const user = await db('Users').where('email', email).first();
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.user_id, role: user.role }, secret, { expiresIn: '8h' });
    res.json({ token, user: { user_id: user.user_id, full_name: user.full_name, role: user.role } });
  } catch (err) { next(err); }
}

module.exports = { register, login };
