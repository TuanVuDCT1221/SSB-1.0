require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initSocket } = require('./utils/socket');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const busRoutes = require('./routes/buses');
const routeRoutes = require('./routes/routes');
const stopRoutes = require('./routes/stops');
const studentRoutes = require('./routes/students');
const scheduleRoutes = require('./routes/schedules');
const tripRoutes = require('./routes/trips');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/notifications', notificationRoutes);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
});

// socket init (attach to server)
const io = initSocket(server);

// start
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`SSB backend running on port ${PORT}`);
});
