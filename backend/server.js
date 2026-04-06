const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB connection
const db = require('./config/db');

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

// Use routes
app.use('/students', studentRoutes);
app.use('/rooms', roomRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);
app.use('/complaints', complaintRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Smart Hostel Backend Running');
});

// Start server (ALWAYS LAST)
const errorHandler = require('./middleware/errorHandler');

app.use(errorHandler);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});