require('./config/env');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const trajetRoutes = require('./routes/trajetRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('CampusRide API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trajets', trajetRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/evaluations', evaluationRoutes);

module.exports = app;
