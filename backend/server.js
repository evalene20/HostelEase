const express = require('express');
const app = express();

const errorHandler = require('./middleware/errorHandler');

app.use(express.json()); // REQUIRED

// Routes
const studentRoutes = require('./routes/studentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const roomRoutes = require('./routes/roomRoutes');

app.use('/students', studentRoutes);
app.use('/bookings', bookingRoutes);
app.use('/complaints', complaintRoutes);
app.use('/payments', paymentRoutes);
app.use('/rooms', roomRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});