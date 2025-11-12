const db = require('../db');
const { getIo } = require('../utils/socket');

async function startTrip(req, res, next) {
  try {
    const scheduleId = parseInt(req.params.scheduleId, 10);
    const schedule = await db('Schedules').where('schedule_id', scheduleId).first();
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });

    // create trip
    // schedule_id is unique in BusTrips according to schema - if exists update
    const existing = await db('BusTrips').where('schedule_id', scheduleId).first();
    if (existing) {
      await db('BusTrips').where('trip_id', existing.trip_id).update({ status: 'in_progress', actual_start_time: db.fn.now() });
      const io = getIo(); io && io.to('admin').emit('trip:started', { tripId: existing.trip_id, scheduleId });
      return res.json({ ok: true, tripId: existing.trip_id });
    }

    const [tripId] = await db('BusTrips').insert({
      schedule_id: scheduleId,
      current_latitude: null,
      current_longitude: null,
      status: 'in_progress',
      actual_start_time: db.fn.now()
    });
    const io = getIo(); io && io.to('admin').emit('trip:started', { tripId, scheduleId });
    res.json({ ok: true, tripId });
  } catch (err) { next(err); }
}

async function endTrip(req, res, next) {
  try {
    const tripId = parseInt(req.params.tripId, 10);
    await db('BusTrips').where('trip_id', tripId).update({ status: 'completed', actual_end_time: db.fn.now() });
    const io = getIo(); io && io.to('admin').emit('trip:ended', { tripId });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

async function updateLocation(req, res, next) {
  try {
    const tripId = parseInt(req.params.tripId,10);
    const { lat, lng, speed } = req.body;
    await db('BusTrips').where('trip_id', tripId).update({ current_latitude: lat, current_longitude: lng, current_speed_kph: speed || 0 });
    // broadcast
    const io = getIo();
    const trip = await db('BusTrips').where('trip_id', tripId).first();
    const busId = trip ? trip.schedule_id : null;
    io && io.to('admin').emit('location:update', { tripId, busId, lat, lng, speed, timestamp: new Date() });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

async function listInProgress(req, res, next) {
  try {
    const rows = await db('BusTrips as bt')
      .join('Schedules as sc','bt.schedule_id','sc.schedule_id')
      .join('Buses as b','sc.bus_id','b.bus_id')
      .join('Users as u','sc.driver_user_id','u.user_id')
      .select('bt.trip_id','bt.current_latitude','bt.current_longitude','bt.current_speed_kph','b.license_plate','u.full_name as driver_name','sc.route_id')
      .where('bt.status','in_progress');
    res.json(rows);
  } catch (err) { next(err); }
}

async function pickupStudent(req, res, next) {
  try {
    const { tripId, studentId } = req.params;
    await db('StudentTripStatus').insert({
      trip_id: tripId,
      student_id: studentId,
      status: 'on_bus',
      check_in_time: db.fn.now()
    }).onConflict(['trip_id','student_id']).merge({ status: 'on_bus', check_in_time: db.fn.now() });
    // notify
    const student = await db('Students').where('student_id', studentId).first();
    const io = getIo();
    if (student && student.parent_user_id) io && io.to(`parent:${student.parent_user_id}`).emit('student:status', { studentId, tripId, status: 'on_bus' });
    io && io.to('admin').emit('student:status', { studentId, tripId, status: 'on_bus' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

async function dropoffStudent(req, res, next) {
  try {
    const { tripId, studentId } = req.params;
    await db('StudentTripStatus').insert({
      trip_id: tripId,
      student_id: studentId,
      status: 'at_school',
      check_out_time: db.fn.now()
    }).onConflict(['trip_id','student_id']).merge({ status: 'at_school', check_out_time: db.fn.now() });
    const student = await db('Students').where('student_id', studentId).first();
    const io = getIo();
    if (student && student.parent_user_id) io && io.to(`parent:${student.parent_user_id}`).emit('student:status', { studentId, tripId, status: 'at_school' });
    io && io.to('admin').emit('student:status', { studentId, tripId, status: 'at_school' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

module.exports = { startTrip, endTrip, updateLocation, listInProgress, pickupStudent, dropoffStudent };
