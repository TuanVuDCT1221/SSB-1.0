const db = require('../db');

async function list(req, res, next) {
  try {
    const { date } = req.query;
    let q = db('Schedules as sc')
      .join('Routes as r','sc.route_id','r.route_id')
      .join('Buses as b','sc.bus_id','b.bus_id')
      .join('Users as u','sc.driver_user_id','u.user_id')
      .select('sc.*','r.name as route_name','b.license_plate','u.full_name as driver_name');
    if (date) q = q.where('schedule_date', date);
    const rows = await q;
    res.json(rows);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { route_id, bus_id, driver_user_id, schedule_date, departure_time } = req.body;
    const [id] = await db('Schedules').insert({ route_id, bus_id, driver_user_id, schedule_date, departure_time });
    res.json({ ok: true, schedule_id: id });
  } catch (err) { next(err); }
}

module.exports = { list, create };
