const db = require('../db');

async function list(req, res, next) {
  try {
    const rows = await db('Buses').select('*');
    res.json(rows);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { license_plate, capacity, model, status } = req.body;
    const [id] = await db('Buses').insert({ license_plate, capacity, model, status });
    res.json({ ok: true, bus_id: id });
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    const id = req.params.id;
    const b = await db('Buses').where('bus_id', id).first();
    if (!b) return res.status(404).json({ error: 'Not found' });
    res.json(b);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    await db('Buses').where('bus_id', id).update(req.body);
    res.json({ ok: true });
  } catch (err) { next(err); }
}

module.exports = { list, create, get, update };
