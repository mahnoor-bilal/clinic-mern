const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
const app = express();

if (process.env.NODE_ENV !== 'test') connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// ------------------ API ROUTES ------------------
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/patients',     require('./routes/patients'));
app.use('/api/doctors',      require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions',require('./routes/prescriptions'));
app.use('/api/admin',        require('./routes/admin'));

app.get('/', (req, res) => res.json({ message: 'Clinic API running' }));

// ------------------ SERVE REACT ------------------
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'client', 'build'); // correct path
  app.use(express.static(buildPath));

  // Catch all other routes and send React index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// ------------------ ERROR HANDLER ------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;