const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

if (process.env.NODE_ENV !== 'test') connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

const path = require('path');



// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/patients',     require('./routes/patients'));
app.use('/api/doctors',      require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions',require('./routes/prescriptions'));
app.use('/api/admin',        require('./routes/admin'));

app.get('/', (req, res) => res.json({ message: 'Clinic API running' }));
// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.resolve(__dirname, '../client/build');

  // serve static files
  app.use(express.static(buildPath));

  // send React index.html for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
}
app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
