const db = require('../db');

async function list(req, res, next) {
  try {
    const rows = await db('Notifications').select('*').orderBy('created_at','desc').limit(100);
    res.json(rows);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { sender_user_id, receiver_user_id, message } = req.body;
    const [id] = await db('Notifications').insert({ sender_user_id, receiver_user_id, message });
    res.json({ ok: true, notification_id: id });
  } catch (err) { next(err); }
}

module.exports = { list, create };
