const socketIo = require('socket.io');
const db = require('../db');

let io;

function initSocket(server) {
  io = socketIo(server, {
    cors: { origin: '*', methods: ['GET','POST'] }
  });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    // client should emit 'register' with { role, userId } after connect
    socket.on('register', async (payload) => {
      try {
        const { role, userId } = payload;
        if (role === 'driver') {
          socket.join(`driver:${userId}`);
        } else if (role === 'admin') {
          socket.join('admin');
        } else if (role === 'parent') {
          socket.join(`parent:${userId}`);
        }
        // optionally send ack
        socket.emit('registered', { ok: true });
      } catch (err) { console.error(err); }
    });

    // driver sends location updates
    socket.on('driver:location', async (payload) => {
      // payload: { driverUserId, tripId, busId, lat, lng, speed }
      try {
        const { driverUserId, tripId, busId, lat, lng, speed } = payload;

        // Save latest location in BusTrips (current_latitude/current_longitude)
        await db('BusTrips').where('trip_id', tripId).update({
          current_latitude: lat,
          current_longitude: lng,
          current_speed_kph: speed,
        });

        // Optionally insert history to BusLocations if you create such table.
        // await db('BusLocations').insert({ trip_id: tripId, bus_id: busId, latitude: lat, longitude: lng, speed_kph: speed });

        // Broadcast to admin room
        io.to('admin').emit('location:update', { tripId, busId, lat, lng, speed, driverUserId, timestamp: new Date() });

        // Find students assigned to this route/trip and notify their parents if needed
        // Query students for trip's route: get parent_user_id list
        const trip = await db('BusTrips').where('trip_id', tripId).first();
        if (trip) {
          const students = await db('Students').where('route_id', trip.route_id);
          for (const s of students) {
            if (s.parent_user_id) {
              io.to(`parent:${s.parent_user_id}`).emit('location:update', { tripId, busId, lat, lng, speed, driverUserId, timestamp: new Date() });
            }
          }
        }
      } catch (err) {
        console.error('driver:location error', err);
      }
    });

    // driver updates pickup/dropoff
    socket.on('driver:updateStudentStatus', async (payload) => {
      // payload: { tripId, studentId, action: 'picked_up'|'dropped_off' }
      try {
        const { tripId, studentId, action } = payload;
        if (action === 'picked_up') {
          await db('StudentTripStatus')
            .where({ trip_id: tripId, student_id: studentId })
            .update({ status: 'on_bus', check_in_time: db.fn.now() });
          // notify parent
          const s = await db('Students').where('student_id', studentId).first();
          if (s && s.parent_user_id) {
            io.to(`parent:${s.parent_user_id}`).emit('student:status', { studentId, tripId, status: 'on_bus' });
          }
          io.to('admin').emit('student:status', { studentId, tripId, status: 'on_bus' });
        } else if (action === 'dropped_off') {
          await db('StudentTripStatus')
            .where({ trip_id: tripId, student_id: studentId })
            .update({ status: 'at_school', check_out_time: db.fn.now() });
          const s = await db('Students').where('student_id', studentId).first();
          if (s && s.parent_user_id) {
            io.to(`parent:${s.parent_user_id}`).emit('student:status', { studentId, tripId, status: 'at_school' });
          }
          io.to('admin').emit('student:status', { studentId, tripId, status: 'at_school' });
        }
      } catch (err) { console.error(err); }
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected', socket.id);
    });
  });

  return io;
}

function getIo() { return io; }

module.exports = { initSocket, getIo };
