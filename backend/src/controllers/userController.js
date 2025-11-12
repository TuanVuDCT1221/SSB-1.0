const db = require('../db');

async function getAllUsers(req, res, next) {
  try {
    const [rows] = await db.query('SELECT user_id, full_name, email, role FROM Users');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers };
