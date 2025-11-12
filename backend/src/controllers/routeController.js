const db = require('../db');

async function list(req, res, next) {
  try {
    const rows = await db('Routes').select('*');
    res.json(rows);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, start_point, end_point, total_distance_km } = req.body;
    const [id] = await db('Routes').insert({ name, start_point, end_point, total_distance_km });
    res.json({ ok: true, route_id: id });
  } catch (err) { next(err); }
}

async function stopsByRoute(req, res, next) {
  try {
    const id = req.params.id;
    const stops = await db('Stops').where('route_id', id).orderBy('stop_order');
    res.json(stops);
  } catch (err) { next(err); }
}

module.exports = { list, create, stopsByRoute };
